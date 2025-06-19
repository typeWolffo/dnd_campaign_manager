interface ElysiaWebSocketContext {
  query: { token: string };
  params: { roomId: string };
  user?: {
    id: string;
    name?: string;
    email: string;
  };
  roomId?: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
}

interface ElysiaWebSocketData {
  id: string;
  data: ElysiaWebSocketContext;
}

interface ElysiaWebSocket {
  data: ElysiaWebSocketData;
  send: (message: string) => void;
  close: (code?: number, reason?: string) => void;
}

interface RoomPresence {
  userId: string;
  userName: string;
  userEmail: string;
  connectedAt: number;
  lastSeen: number;
}

interface NoteUpdateData {
  noteId: string;
  title?: string;
  content?: string;
  [key: string]: unknown;
}

interface NoteCreateData {
  title: string;
  content?: string;
  roomId: string;
  [key: string]: unknown;
}

interface NoteDeleteData {
  noteId: string;
}

interface CursorPositionData {
  x: number;
  y: number;
  elementId?: string;
  [key: string]: unknown;
}

interface PresenceUpdateData {
  type: 'user_joined' | 'user_left';
  user?: RoomPresence;
  userId?: string;
  totalUsers: number;
}

type MessageData = NoteUpdateData | NoteCreateData | NoteDeleteData | CursorPositionData | PresenceUpdateData;

interface WebSocketMessage {
  type: 'note_update' | 'note_create' | 'note_delete' | 'presence_update' | 'cursor_position';
  data: MessageData;
  userId: string;
  timestamp: number;
}

interface WebSocketLike {
  data: {
    user?: { id: string; name?: string; email: string };
    [key: string]: unknown;
  };
  send: (message: string) => void;
  close?: (code?: number, reason?: string) => void;
}

class WebSocketManager {
  private rooms = new Map<string, Set<WebSocketLike>>();
  private userPresence = new Map<string, Map<string, RoomPresence>>();
  private wsUserData = new Map<WebSocketLike, { roomId: string; userId: string; userName: string; userEmail: string }>();

  joinRoom(ws: WebSocketLike, roomId: string, userId: string, userName: string, userEmail: string) {
    this.wsUserData.set(ws, { roomId, userId, userName, userEmail });

    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
      this.userPresence.set(roomId, new Map());
    }

    this.rooms.get(roomId)!.add(ws);

    const presence: RoomPresence = {
      userId,
      userName,
      userEmail,
      connectedAt: Date.now(),
      lastSeen: Date.now()
    };

    this.userPresence.get(roomId)!.set(userId, presence);

    this.broadcastToRoom(roomId, {
      type: 'presence_update',
      data: {
        type: 'user_joined',
        user: presence,
        totalUsers: this.userPresence.get(roomId)!.size
      },
      userId,
      timestamp: Date.now()
    }, userId);

    console.log(`👥 User ${userName} joined room ${roomId}`);
  }

  leaveRoom(ws: WebSocketLike) {
    const userData = this.wsUserData.get(ws);
    if (!userData) return;

    const { roomId, userId, userName } = userData;

    const roomConnections = this.rooms.get(roomId);
    if (roomConnections) {
      roomConnections.delete(ws);
      this.wsUserData.delete(ws);

      if (roomConnections.size === 0) {
        this.rooms.delete(roomId);
        this.userPresence.delete(roomId);
      } else {
        this.userPresence.get(roomId)?.delete(userId);

        this.broadcastToRoom(roomId, {
          type: 'presence_update',
          data: {
            type: 'user_left',
            userId,
            totalUsers: this.userPresence.get(roomId)?.size || 0
          },
          userId,
          timestamp: Date.now()
        }, userId);
      }
    }

    console.log(`👋 User ${userName} left room ${roomId}`);
  }

  broadcastToRoom(roomId: string, message: WebSocketMessage, excludeUserId?: string) {
    const roomConnections = this.rooms.get(roomId);
    if (!roomConnections) return;

    const messageStr = JSON.stringify(message);

    for (const ws of roomConnections) {
      const userData = this.wsUserData.get(ws);
      if (excludeUserId && userData?.userId === excludeUserId) continue;

      try {
        ws.send(messageStr);
      } catch (error) {
        console.error(`Failed to send message to user ${userData?.userId}:`, error);
        this.leaveRoom(ws);
      }
    }
  }

  handleMessage(ws: WebSocketLike, message: WebSocketMessage) {
    const userData = this.wsUserData.get(ws);
    if (!userData) return;

    const { roomId, userId } = userData;

    this.updateUserPresence(roomId, userId);

    switch (message.type) {
      case 'note_update':
        this.broadcastToRoom(roomId, {
          ...message,
          userId,
          timestamp: Date.now()
        }, userId);
        break;

      case 'note_create':
        this.broadcastToRoom(roomId, {
          ...message,
          userId,
          timestamp: Date.now()
        }, userId);
        break;

      case 'note_delete':
        this.broadcastToRoom(roomId, {
          ...message,
          userId,
          timestamp: Date.now()
        }, userId);
        break;

      case 'cursor_position':
        this.broadcastToRoom(roomId, {
          ...message,
          userId,
          timestamp: Date.now()
        }, userId);
        break;

      default:
        console.warn(`Unknown message type: ${message.type}`);
    }
  }

  private updateUserPresence(roomId: string, userId: string) {
    const roomPresence = this.userPresence.get(roomId);
    if (roomPresence?.has(userId)) {
      const presence = roomPresence.get(userId)!;
      presence.lastSeen = Date.now();
    }
  }

  getRoomPresence(roomId: string): RoomPresence[] {
    const roomPresence = this.userPresence.get(roomId);
    if (!roomPresence) return [];

    return Array.from(roomPresence.values());
  }

  getRoomConnectionCount(roomId: string): number {
    return this.rooms.get(roomId)?.size || 0;
  }
}

export const wsManager = new WebSocketManager();
export type { WebSocketMessage, RoomPresence };
