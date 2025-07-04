import { inject, injectable } from 'inversify';
import { eq, and } from 'drizzle-orm';
import { rooms, roomMembers, sessions, users } from '../../db/schema';
import { TYPES } from '../../core/di.types';
import type { DbInstance } from '../../db/connection';
import { auth } from '../../auth/config';
import { addConnection, removeConnection, broadcastToRoom } from '../../lib/websocket-utils';
import type {
  ConnectionInfo,
  IncomingMessage,
  NoteUpdateData,
  MemberUpdateData,
  NoteUpdateMessage,
  MemberUpdateMessage
} from '../../schemas/websocket';

export interface AuthenticatedUser {
  id: string;
  name: string | null;
  email: string;
}

export interface ConnectionResult {
  success: boolean;
  user?: AuthenticatedUser;
  error?: string;
  closeCode?: number;
}

@injectable()
export class WebSocketService {
  private connections = new Map<string, { ws: unknown; info: ConnectionInfo }>();

  constructor(@inject(TYPES.Db) private readonly db: DbInstance) {}

  async authenticateConnection(token: string): Promise<AuthenticatedUser | null> {
    try {
      // Method 1: Direct token validation via better-auth
      const session = await auth.api.getSession({
        headers: new Headers({
          authorization: `Bearer ${token}`,
        }),
      });

      if (session?.user) {
        return {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
        };
      }
    } catch (error) {
      console.log("❌ Bearer token failed, trying cookie formats...");
    }

    // Method 2: Try different cookie formats as fallback
    const cookieFormats = [
      `better-auth.session_token=${token}`,
      `session_token=${token}`,
      `authjs.session-token=${token}`,
    ];

    for (const cookieFormat of cookieFormats) {
      try {
        const session = await auth.api.getSession({
          headers: new Headers({ cookie: cookieFormat }),
        });
        if (session?.user) {
          return {
            id: session.user.id,
            name: session.user.name,
            email: session.user.email,
          };
        }
      } catch (error) {
        // Continue to next format
      }
    }

    // Method 3: Direct database lookup as last resort
    try {
      const dbSession = await this.db
        .select({
          userId: sessions.userId,
          sessionId: sessions.id,
          userName: users.name,
          userEmail: users.email,
        })
        .from(sessions)
        .innerJoin(users, eq(users.id, sessions.userId))
        .where(eq(sessions.token, token))
        .limit(1);

      if (dbSession[0]) {
        return {
          id: dbSession[0].userId,
          name: dbSession[0].userName,
          email: dbSession[0].userEmail,
        };
      }
    } catch (error) {
      console.log("❌ Database lookup failed:", error);
    }

    return null;
  }

  async validateRoomAccess(roomId: string, userId: string): Promise<{ allowed: boolean; isGM: boolean; role?: string }> {
    const room = await this.db
      .select()
      .from(rooms)
      .where(eq(rooms.id, roomId))
      .limit(1);

    if (!room[0]) {
      return { allowed: false, isGM: false };
    }

    const memberCheck = await this.db
      .select({ role: roomMembers.role })
      .from(roomMembers)
      .where(
        and(
          eq(roomMembers.roomId, roomId),
          eq(roomMembers.userId, userId)
        )
      )
      .limit(1);

    const isGM = room[0].gmId === userId;
    const isMember = memberCheck[0];

    if (!isGM && !isMember) {
      return { allowed: false, isGM: false };
    }

    return {
      allowed: true,
      isGM,
      role: isGM ? "gm" : (memberCheck[0]?.role || "player")
    };
  }

  addConnection(connectionId: string, ws: unknown, info: ConnectionInfo): void {
    this.connections.set(connectionId, { ws, info });
    addConnection(connectionId, ws, info.roomId);
  }

  removeConnection(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (connection) {
      removeConnection(connectionId);
      this.connections.delete(connectionId);
    }
  }

  findConnectionId(ws: unknown): string | null {
    for (const [id, connection] of this.connections) {
      if (connection.ws === ws) return id;
    }
    return null;
  }

  getConnection(connectionId: string): { ws: unknown; info: ConnectionInfo } | null {
    return this.connections.get(connectionId) || null;
  }

  handleMessage(connectionId: string, message: IncomingMessage): void {
    const connection = this.getConnection(connectionId);
    if (!connection) return;

    const { type, roomId, data } = message;
    const { info } = connection;

    if (info.roomId !== roomId) {
      const ws = connection.ws as any;
      ws.send(JSON.stringify({ type: "error", message: "Room mismatch" }));
      return;
    }

    switch (type) {
      case "note_update":
        if (info.role === "gm" && data) {
          const noteData = data as NoteUpdateData;
          const noteUpdateMessage: NoteUpdateMessage = {
            type: "note_update",
            noteId: noteData.noteId,
            action: noteData.action,
          };
          broadcastToRoom(roomId, noteUpdateMessage, connectionId);
        }
        break;

      case "member_update":
        if (data) {
          const memberData = data as MemberUpdateData;
          const memberUpdateMessage: MemberUpdateMessage = {
            type: "member_update",
            action: memberData.action,
            member: memberData.member,
          };
          broadcastToRoom(roomId, memberUpdateMessage, connectionId);
        }
        break;

      default:
        const ws = connection.ws as any;
        ws.send(JSON.stringify({ type: "error", message: "Unknown message type" }));
    }
  }
}
