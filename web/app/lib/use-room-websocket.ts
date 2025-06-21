import { useEffect } from "react";
import { useWebSocket } from "./websocket-context";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./query-keys";
import type { WebSocketMessage } from "./websocket";

export const useRoomWebSocket = (roomId: string | null) => {
  const webSocket = useWebSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (roomId) {
      const handleNoteUpdate = (data: WebSocketMessage) => {
        if (data.type === "note_update") {
          queryClient.invalidateQueries({
            queryKey: queryKeys.notes.byRoomId(roomId).queryKey,
          });
        }
      };

      const handleMemberUpdate = (data: WebSocketMessage) => {
        if (data.type === "member_update") {
          queryClient.invalidateQueries({
            queryKey: queryKeys.rooms.byId(roomId).queryKey,
          });
        }
      };

      webSocket.on("note_update", handleNoteUpdate);
      webSocket.on("member_update", handleMemberUpdate);

      webSocket.connectToRoom(roomId);

      return () => {
        webSocket.off("note_update", handleNoteUpdate);
        webSocket.off("member_update", handleMemberUpdate);
      };
    }
  }, [roomId, webSocket, queryClient]);

  return {
    status: webSocket.status,
    isConnected: webSocket.isConnected,
    connectedRoomId: webSocket.connectedRoomId,
  };
};
