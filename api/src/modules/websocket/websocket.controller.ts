import Elysia from 'elysia';
import { WebSocketService } from './websocket.service';
import { WebSocketQuerySchema, IncomingMessageSchema, type ConnectionInfo, type IncomingMessage } from '../../schemas/websocket';

export const createWebSocketController = (webSocketService: WebSocketService) =>
  new Elysia({ name: 'websocket-controller' })
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

          // Authenticate user
          const user = await webSocketService.authenticateConnection(token);

          if (!user) {
            console.log("❌ No valid session, closing connection");
            ws.close(4001, "Unauthorized");
            return;
          }

          console.log("🔐 Session result: Found");
          console.log("👤 User:", user.email);

          // Validate room access
          const roomAccess = await webSocketService.validateRoomAccess(roomId, user.id);

          if (!roomAccess.allowed) {
            if (!roomAccess.isGM && !roomAccess.role) {
              ws.close(4003, "Access denied");
            } else {
              ws.close(4004, "Room not found");
            }
            return;
          }

          // Create connection
          const connectionId = crypto.randomUUID();
          const info: ConnectionInfo = {
            userId: user.id,
            userName: user.name || user.email,
            roomId,
            role: roomAccess.role!,
          };

          webSocketService.addConnection(connectionId, ws, info);

          ws.subscribe(`room:${roomId}`);

          ws.send(JSON.stringify({
            type: "connected",
            roomId,
            userId: user.id,
          }));

          console.log(`🔌 User ${info.userName} connected to room ${roomId}`);

        } catch (error) {
          console.error("WebSocket auth error:", error);
          ws.close(4001, "Authentication failed");
        }
      },

      message(ws, message: IncomingMessage) {
        try {
          const connectionId = webSocketService.findConnectionId(ws);
          if (!connectionId) return;

          webSocketService.handleMessage(connectionId, message);
        } catch (error) {
          console.error("WebSocket message error:", error);
          const ws_typed = ws as any;
          ws_typed.send(JSON.stringify({ type: "error", message: "Message processing failed" }));
        }
      },

      close(ws) {
        const connectionId = webSocketService.findConnectionId(ws);
        if (!connectionId) return;

        const connection = webSocketService.getConnection(connectionId);
        if (connection) {
          const { info } = connection;

          webSocketService.removeConnection(connectionId);

          console.log(`🔌 User ${info.userName} disconnected from room ${info.roomId}`);
        }
      }
    });
