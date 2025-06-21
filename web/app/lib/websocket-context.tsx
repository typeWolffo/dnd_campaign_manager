import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { webSocketManager } from "./websocket-manager";
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

  useEffect(() => {
    const handleStatusChange = (newStatus: WebSocketStatus) => {
      setStatus(newStatus);
      setConnectedRoomId(webSocketManager.connectedRoomId);
    };

    webSocketManager.onStatusChange(handleStatusChange);

    return () => {
      webSocketManager.offStatusChange(handleStatusChange);
      webSocketManager.disconnect();
    };
  }, []);

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
