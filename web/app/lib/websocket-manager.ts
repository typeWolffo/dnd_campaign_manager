import { RoomWebSocket, type WebSocketStatus, type WebSocketMessage } from "./websocket";
import { authClient } from "./auth-client";

const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
};

export class WebSocketManager {
  private ws: RoomWebSocket | null = null;
  private currentRoomId: string | null = null;
  private status: WebSocketStatus = "disconnected";
  private statusListeners = new Set<(status: WebSocketStatus) => void>();
  private isConnecting = false;

  async connectToRoom(roomId: string) {
    if (this.currentRoomId === roomId && this.status === "connected") {
      return;
    }

    if (this.isConnecting) {
      return;
    }

    this.isConnecting = true;

    try {
      if (this.ws && this.currentRoomId !== roomId) {
        this.ws.disconnect();
        this.ws = null;
      }

      // Get token
      let token =
        getCookie("better-auth.session_token") ||
        getCookie("authjs.session-token") ||
        getCookie("next-auth.session-token") ||
        getCookie("session-token") ||
        getCookie("session");

      if (!token) {
        const session = await authClient.getSession();
        if (session?.data?.session?.token) {
          token = session.data.session.token;
        }
      }

      if (!token) {
        throw new Error("No authentication token available");
      }

      // Create new connection
      this.ws = new RoomWebSocket(roomId, token);
      this.currentRoomId = roomId;

      this.ws.onStatusChange(status => {
        this.status = status;
        this.notifyStatusListeners(status);
      });

      await this.ws.connect();
    } catch (error) {
      console.error("❌ Failed to connect to room:", error);
      this.status = "error";
      this.notifyStatusListeners("error");
    } finally {
      this.isConnecting = false;
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.disconnect();
      this.ws = null;
    }
    this.currentRoomId = null;
    this.status = "disconnected";
    this.notifyStatusListeners("disconnected");
  }

  on<T = WebSocketMessage>(type: string, listener: (data: T) => void) {
    if (this.ws) {
      this.ws.on(type, listener);
    } else {
      console.warn("WebSocket not connected, cannot add listener for:", type);
    }
  }

  off<T = WebSocketMessage>(type: string, listener: (data: T) => void) {
    if (this.ws) {
      this.ws.off(type, listener);
    }
  }

  send(type: string, data?: unknown) {
    if (this.ws) {
      this.ws.send(type, data);
    } else {
      console.warn("WebSocket not connected, cannot send:", type);
    }
  }

  onStatusChange(listener: (status: WebSocketStatus) => void) {
    this.statusListeners.add(listener);
    listener(this.status);
  }

  offStatusChange(listener: (status: WebSocketStatus) => void) {
    this.statusListeners.delete(listener);
  }

  private notifyStatusListeners(status: WebSocketStatus) {
    this.statusListeners.forEach(listener => {
      try {
        listener(status);
      } catch (error) {
        console.error("Error in WebSocket status listener:", error);
      }
    });
  }

  get currentStatus() {
    return this.status;
  }

  get connectedRoomId() {
    return this.currentRoomId;
  }

  get isConnected() {
    return this.status === "connected";
  }
}

export const webSocketManager = new WebSocketManager();
