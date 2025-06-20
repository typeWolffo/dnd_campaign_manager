import type { TypedWebSocketMessage } from "../schemas/websocket";

const connections = new Map<string, { ws: unknown; info: { roomId: string } }>();
const roomConnections = new Map<string, Set<string>>();

export const addConnection = (connectionId: string, ws: unknown, roomId: string) => {
  connections.set(connectionId, { ws, info: { roomId } });

  if (!roomConnections.has(roomId)) {
    roomConnections.set(roomId, new Set());
  }
  roomConnections.get(roomId)!.add(connectionId);
};

export const removeConnection = (connectionId: string) => {
  const connection = connections.get(connectionId);
  if (connection) {
    const roomId = connection.info.roomId;
    roomConnections.get(roomId)?.delete(connectionId);
    connections.delete(connectionId);
  }
};

export const broadcastToRoom = (roomId: string, message: TypedWebSocketMessage, excludeConnectionId?: string) => {
  const roomConns = roomConnections.get(roomId);
  if (!roomConns) {
    console.log(`No connections found for room ${roomId}`);
    return;
  }

  const messageStr = JSON.stringify(message);
  let sentCount = 0;

  for (const connectionId of roomConns) {
    if (connectionId === excludeConnectionId) continue;

    const connection = connections.get(connectionId);
    if (connection) {
      try {
        (connection.ws as { send: (data: string) => void }).send(messageStr);
        sentCount++;
      } catch (error) {
        console.error("Failed to send message to connection:", error);
        connections.delete(connectionId);
        roomConns.delete(connectionId);
      }
    }
  }

  console.log(`📡 Broadcasted ${message.type} to ${sentCount} connections in room ${roomId}`);
};
