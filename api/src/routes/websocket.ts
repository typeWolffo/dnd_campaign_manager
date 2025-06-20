import { Elysia, t } from "elysia";
import { auth } from "../auth/config";
import { db } from "../db/connection";
import { rooms, roomMembers, sessions, users } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { addConnection, removeConnection, broadcastToRoom } from "../lib/websocket-utils";
import {
  ConnectionInfo,
  IncomingMessage,
  IncomingMessageSchema,
  WebSocketQuerySchema,
  NoteUpdateData,
  MemberUpdateData,
  type NoteUpdateMessage,
  type MemberUpdateMessage,
} from "../schemas/websocket";

const connections = new Map<string, { ws: unknown; info: ConnectionInfo }>();

export const websocketRouter = new Elysia()
  .onRequest((context) => {
    if (context.request.url.includes('/ws')) {
      console.log("🌍 WebSocket request received:", context.request.url);
    }
  })
  .onError(({ error, code }) => {
    if (code === 'VALIDATION') {
      console.log("❌ WebSocket validation error:", error);
    } else {
      console.log("❌ WebSocket error:", code, error);
    }
    return { error: String(error), code };
  })
  .ws("/ws", {
    query: WebSocketQuerySchema,

    async open(ws) {
      console.log("🔌 WebSocket open event triggered");
      const { token, roomId } = ws.data.query;

      try {
        console.log("🔌 WebSocket connecting with token:", token?.substring(0, 10) + "...");
        console.log("🔌 WebSocket roomId:", roomId);
        console.log("🔌 Token length:", token?.length);

        // Try to verify session directly using the token
        let session = null;

        try {
          // Method 1: Direct token validation
          session = await auth.api.getSession({
            headers: new Headers({
              authorization: `Bearer ${token}`,
            }),
          });

          if (session?.user) {
            console.log("✅ Bearer token worked");
          }
        } catch (error) {
          console.log("❌ Bearer token failed, trying cookie formats...");

          // Method 2: Try different cookie formats as fallback
          const cookieFormats = [
            `better-auth.session_token=${token}`,
            `session_token=${token}`,
            `authjs.session-token=${token}`,
          ];

                      for (const cookieFormat of cookieFormats) {
              try {
                console.log("🍪 Trying cookie format:", cookieFormat.substring(0, 30) + "...");
                session = await auth.api.getSession({
                  headers: new Headers({ cookie: cookieFormat }),
                });
                if (session?.user) {
                  console.log("✅ Cookie format worked:", cookieFormat.split('=')[0]);
                  break;
                }
              } catch (error) {
                console.log("❌ Cookie format failed:", cookieFormat.split('=')[0]);
              }
            }
          }

          // Method 3: Direct database lookup as last resort
          if (!session?.user) {
            console.log("❌ All methods failed, trying direct database lookup...");
            try {
              const dbSession = await db
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
                console.log("✅ Direct database lookup worked");
                session = {
                  user: {
                    id: dbSession[0].userId,
                    name: dbSession[0].userName,
                    email: dbSession[0].userEmail,
                  },
                };
              }
            } catch (error) {
              console.log("❌ Database lookup failed:", error);
            }
          }

        console.log("🔐 Session result:", session ? "Found" : "Not found");
        if (session) {
          console.log("👤 User:", session.user?.email);
        }

        if (!session?.user) {
          console.log("❌ No valid session, closing connection");
          ws.close(4001, "Unauthorized");
          return;
        }

        const room = await db
          .select()
          .from(rooms)
          .where(eq(rooms.id, roomId))
          .limit(1);

        if (!room[0]) {
          ws.close(4004, "Room not found");
          return;
        }

        const memberCheck = await db
          .select({ role: roomMembers.role })
          .from(roomMembers)
          .where(
            and(
              eq(roomMembers.roomId, roomId),
              eq(roomMembers.userId, session.user.id)
            )
          )
          .limit(1);

        const isGM = room[0].gmId === session.user.id;
        const isMember = memberCheck[0];

        if (!isGM && !isMember) {
          ws.close(4003, "Access denied");
          return;
        }

        const connectionId = crypto.randomUUID();
        const info: ConnectionInfo = {
          userId: session.user.id,
          userName: session.user.name || session.user.email,
          roomId,
          role: isGM ? "gm" : (memberCheck[0]?.role || "player"),
        };

        connections.set(connectionId, { ws, info });
        addConnection(connectionId, ws, roomId);

        ws.subscribe(`room:${roomId}`);

        ws.send(JSON.stringify({
          type: "connected",
          roomId,
          userId: session.user.id,
        }));

        console.log(`🔌 User ${info.userName} connected to room ${roomId}`);

      } catch (error) {
        console.error("WebSocket auth error:", error);
        ws.close(4001, "Authentication failed");
      }
    },

    message(ws, message: IncomingMessage) {
      try {
        const connectionId = findConnectionId(ws);
        if (!connectionId) return;

        const connection = connections.get(connectionId);
        if (!connection) return;

        const { type, roomId, data } = message;
        const { info } = connection;

        if (info.roomId !== roomId) {
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
            ws.send(JSON.stringify({ type: "error", message: "Unknown message type" }));
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
        ws.send(JSON.stringify({ type: "error", message: "Message processing failed" }));
      }
    },

    close(ws) {
      const connectionId = findConnectionId(ws);
      if (!connectionId) return;

      const connection = connections.get(connectionId);
      if (connection) {
        const { info } = connection;

        removeConnection(connectionId);
        connections.delete(connectionId);

        console.log(`🔌 User ${info.userName} disconnected from room ${info.roomId}`);
      }
    },

    body: IncomingMessageSchema,
  });

function findConnectionId(ws: unknown): string | null {
  for (const [id, connection] of connections) {
    if (connection.ws === ws) return id;
  }
  return null;
}
