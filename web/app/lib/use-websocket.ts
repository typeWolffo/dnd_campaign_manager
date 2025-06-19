import { useEffect, useRef, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { RoomWebSocket, type WebSocketStatus } from "./websocket";
import { queryKeys } from "./query-keys";
import { authClient } from "./auth-client";

const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
};

export const useRoomWebSocket = (roomId: string | null) => {
  const [status, setStatus] = useState<WebSocketStatus>("disconnected");
  const queryClient = useQueryClient();
  const wsRef = useRef<RoomWebSocket | null>(null);

  const connect = useCallback(async () => {
    if (!roomId) return;

    console.log("🍪 Available cookies:", document.cookie);

    // Log each cookie individually
    const cookieNames = [
      "better-auth.session_token",
      "authjs.session-token",
      "next-auth.session-token",
      "session-token",
      "session",
    ];

    cookieNames.forEach(name => {
      const value = getCookie(name);
      if (value) {
        console.log(`🍪 Found ${name}:`, value.substring(0, 10) + "...");
      }
    });

    // Try different possible cookie names
    let token =
      getCookie("better-auth.session_token") ||
      getCookie("authjs.session-token") ||
      getCookie("next-auth.session-token") ||
      getCookie("session-token") ||
      getCookie("session");

    if (!token) {
      console.log("❌ No session token found in cookies, trying session API...");

      try {
        // Fallback: try to get session from better-auth client
        const session = await authClient.getSession();
        console.log("🔍 Full session object:", session);
        if (session?.data?.session?.token) {
          token = session.data.session.token;
          console.log("✅ Got session token from authClient");
        } else if (session?.data?.session) {
          console.log("🔍 Session data:", session.data.session);
        }
      } catch (error) {
        console.error("Failed to get session from authClient:", error);
      }
    } else {
      console.log("✅ Found session token in cookies");
    }

    if (!token) {
      console.error("❌ No session token available from cookies or API");
      console.log(
        "🔍 Available cookies:",
        document.cookie.split(";").map(c => c.trim().split("=")[0])
      );
      return;
    }

    console.log("✅ Connecting WebSocket with token:", token.substring(0, 10) + "...");

    if (wsRef.current) {
      wsRef.current.disconnect();
    }

    wsRef.current = new RoomWebSocket(roomId, token);
    wsRef.current.onStatusChange(setStatus);

    const noteUpdateListener = (data: any) => {
      if (data.type === "note_update") {
        console.log("📝 Note update received, refreshing notes...");
        queryClient.invalidateQueries({
          queryKey: queryKeys.notes.byRoomId(roomId).queryKey,
        });
      }
    };

    const memberUpdateListener = (data: any) => {
      if (data.type === "member_update") {
        console.log("👥 Member update received, refreshing room data...");
        queryClient.invalidateQueries({
          queryKey: queryKeys.rooms.byId(roomId).queryKey,
        });
      }
    };

    const connectedListener = (data: any) => {
      if (data.type === "connected") {
        console.log("✅ Connected to room WebSocket");
      }
    };

    wsRef.current.on("note_update", noteUpdateListener);
    wsRef.current.on("member_update", memberUpdateListener);
    wsRef.current.on("connected", connectedListener);

    wsRef.current.connect().catch(console.error);
  }, [roomId, queryClient]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.disconnect();
      wsRef.current = null;
    }
    setStatus("disconnected");
  }, []);

  const on = useCallback((type: string, listener: (data: any) => void) => {
    if (wsRef.current) {
      wsRef.current.on(type, listener);
    }
  }, []);

  const off = useCallback((type: string, listener: (data: any) => void) => {
    if (wsRef.current) {
      wsRef.current.off(type, listener);
    }
  }, []);

  useEffect(() => {
    if (roomId) {
      connect().catch(console.error);
    }

    return () => {
      disconnect();
    };
  }, [roomId, connect, disconnect]);

  return {
    status,
    connect,
    disconnect,
    on,
    off,
    isConnected: status === "connected",
  };
};
