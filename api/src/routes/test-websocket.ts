import { Elysia } from "elysia";

export const testWebsocketRouter = new Elysia()
  .ws("/test-ws", {
    open(ws) {
      console.log("🎯 TEST WebSocket connected!");
      ws.send(JSON.stringify({ type: "test", message: "Hello from test WebSocket!" }));
    },

    message(ws, message) {
      console.log("🎯 TEST WebSocket message:", message);
      ws.send(JSON.stringify({ type: "echo", data: message }));
    },

    close(ws) {
      console.log("🎯 TEST WebSocket closed");
    }
  });
