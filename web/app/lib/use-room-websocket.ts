import { useEffect } from "react";
import { useWebSocket } from "./websocket-context";

export const useRoomWebSocket = (roomId: string | null) => {
  const webSocket = useWebSocket();

  useEffect(() => {
    if (roomId) {
      webSocket.connectToRoom(roomId);
    }
  }, [roomId, webSocket]);

  return {
    status: webSocket.status,
    isConnected: webSocket.isConnected,
    connectedRoomId: webSocket.connectedRoomId,
  };
};
