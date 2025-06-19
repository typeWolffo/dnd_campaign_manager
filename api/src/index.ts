import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { auth } from "./auth/config";
import { roomsRouter } from "./routes/rooms";
import { notesRouter } from "./routes/notes";

console.log("🚀 Setting up Elysia server...");

const betterAuth = new Elysia({ name: "better-auth" })
  .mount(auth.handler)
  .macro({
    auth: {
      async resolve({ status, request: { headers } }) {
        const session = await auth.api.getSession({
          headers,
        });

        if (!session) return status(401);

        return {
          user: session.user,
          session: session.session,
        };
      },
    },
  });

console.log("🔐 Better Auth middleware created");

const app = new Elysia({ prefix: "/api" })
  .use(cors({
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  }))
  .use(swagger())
  .use(betterAuth)
  .use(roomsRouter)
  .use(notesRouter)
  .get("/", () => "D&D Campaign Manager API")
  .get("/health", () => ({ status: "ok", timestamp: new Date().toISOString() }))
  .get("/user", ({ user }) => user, {
    auth: true,
  })
  .listen(3001);

console.log("🦊 Elysia is running at", `${app.server?.hostname}:${app.server?.port}`);
console.log("🔍 Available routes should include /api/auth/* endpoints");

export default app;

export type App = typeof app;
