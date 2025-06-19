export type WebSocketMessage = {
  type: string;
  [key: string]: any;
};

export type WebSocketStatus = "connecting" | "connected" | "disconnected" | "error";

export class RoomWebSocket {
  private ws: WebSocket | null = null;
  private roomId: string;
  private token: string;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners = new Map<string, Set<(data: any) => void>>();
  private statusListeners = new Set<(status: WebSocketStatus) => void>();

  constructor(roomId: string, token: string) {
    this.roomId = roomId;
    this.token = token;

    const isDev = window.location.hostname === "localhost";
    const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = isDev ? "localhost:3001" : "api-dnd.faily-tales.com";

    this.url = `${wsProtocol}//${host}/api/ws?token=${token}&roomId=${roomId}`;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);
        this.notifyStatus("connecting");

        this.ws.onopen = () => {
          console.log("🔌 WebSocket connected to room:", this.roomId);
          this.reconnectAttempts = 0;
          this.notifyStatus("connected");
          resolve();
        };

        this.ws.onmessage = event => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error("Failed to parse WebSocket message:", error);
          }
        };

        this.ws.onclose = event => {
          console.log("🔌 WebSocket closed:", event.code, event.reason);
          this.notifyStatus("disconnected");

          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnect();
          }
        };

        this.ws.onerror = error => {
          console.error("WebSocket error:", error);
          this.notifyStatus("error");
          reject(error);
        };
      } catch (error) {
        this.notifyStatus("error");
        reject(error);
      }
    });
  }

  private reconnect() {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`🔄 Reconnecting to WebSocket in ${delay}ms (attempt ${this.reconnectAttempts})`);

    setTimeout(() => {
      this.connect().catch(console.error);
    }, delay);
  }

  private handleMessage(message: WebSocketMessage) {
    const listeners = this.listeners.get(message.type);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(message);
        } catch (error) {
          console.error("Error in WebSocket listener:", error);
        }
      });
    }
  }

  private notifyStatus(status: WebSocketStatus) {
    this.statusListeners.forEach(listener => {
      try {
        listener(status);
      } catch (error) {
        console.error("Error in status listener:", error);
      }
    });
  }

  send(type: string, data?: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type,
          roomId: this.roomId,
          data,
        })
      );
    } else {
      console.warn("WebSocket is not connected");
    }
  }

  on(type: string, listener: (data: any) => void) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(listener);
  }

  off(type: string, listener: (data: any) => void) {
    const listeners = this.listeners.get(type);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  onStatusChange(listener: (status: WebSocketStatus) => void) {
    this.statusListeners.add(listener);
  }

  offStatusChange(listener: (status: WebSocketStatus) => void) {
    this.statusListeners.delete(listener);
  }

  disconnect() {
    this.ws?.close(1000, "User disconnect");
    this.ws = null;
    this.listeners.clear();
    this.statusListeners.clear();
  }

  get status(): WebSocketStatus {
    if (!this.ws) return "disconnected";

    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return "connecting";
      case WebSocket.OPEN:
        return "connected";
      case WebSocket.CLOSING:
      case WebSocket.CLOSED:
        return "disconnected";
      default:
        return "error";
    }
  }
}
