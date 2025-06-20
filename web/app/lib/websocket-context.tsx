import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { webSocketManager } from "./websocket-manager";
import { queryKeys } from "./query-keys";
import type { WebSocketStatus, WebSocketMessage } from "./websocket";

interface WebSocketContextValue {
  connectToRoom: (roomId: string) => Promise<void>;
  disconnect: () => void;
  status: WebSocketStatus;
  connectedRoomId: string | null;
  isConnected: boolean;
  on: <T = WebSocketMessage>(type: string, listener: (data: T) => void) => void;
  off: <T = WebSocketMessage>(type: string, listener: (data: T) => void) => void;
  send: (type: string, data?: unknown) => void;
}

const WebSocketContext = createContext<WebSocketContextValue | null>(null);

interface WebSocketProviderProps {
  children: ReactNode;
}

export const WebSocketProvider = ({ children }: WebSocketProviderProps) => {
  const [status, setStatus] = useState<WebSocketStatus>("disconnected");
  const [connectedRoomId, setConnectedRoomId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleStatusChange = (newStatus: WebSocketStatus) => {
      setStatus(newStatus);
      setConnectedRoomId(webSocketManager.connectedRoomId);
    };

    const handleNoteUpdate = (data: WebSocketMessage) => {
      if (data.type === "note_update" && webSocketManager.connectedRoomId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.notes.byRoomId(webSocketManager.connectedRoomId).queryKey,
        });
      }
    };

    const handleMemberUpdate = (data: WebSocketMessage) => {
      if (data.type === "member_update" && webSocketManager.connectedRoomId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.rooms.byId(webSocketManager.connectedRoomId).queryKey,
        });
      }
    };

    webSocketManager.onStatusChange(handleStatusChange);
    webSocketManager.on("note_update", handleNoteUpdate);
    webSocketManager.on("member_update", handleMemberUpdate);

    return () => {
      webSocketManager.offStatusChange(handleStatusChange);
      webSocketManager.off("note_update", handleNoteUpdate);
      webSocketManager.off("member_update", handleMemberUpdate);
      webSocketManager.disconnect();
    };
  }, [queryClient]);

  const value: WebSocketContextValue = {
    connectToRoom: webSocketManager.connectToRoom.bind(webSocketManager),
    disconnect: webSocketManager.disconnect.bind(webSocketManager),
    status,
    connectedRoomId,
    isConnected: status === "connected",
    on: webSocketManager.on.bind(webSocketManager),
    off: webSocketManager.off.bind(webSocketManager),
    send: webSocketManager.send.bind(webSocketManager),
  };

  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>;
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};
