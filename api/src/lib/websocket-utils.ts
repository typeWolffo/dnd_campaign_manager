// Simple in-memory connection store that can be accessed from other modules
const connections = new Map<string, { ws: any; info: { roomId: string } }>();
const roomConnections = new Map<string, Set<string>>();

export const addConnection = (connectionId: string, ws: any, roomId: string) => {
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

export const broadcastToRoom = (roomId: string, message: any, excludeConnectionId?: string) => {
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
        connection.ws.send(messageStr);
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
