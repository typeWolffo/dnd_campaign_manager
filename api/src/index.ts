import 'dotenv/config';
import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { auth } from "./auth/config";
import { roomsRouter } from "./routes/rooms";
import { notesRouter } from "./routes/notes";
import { websocketRouter } from "./routes/websocket";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { db } from './db/connection';


// async function runMigrations() {
//   try {
//     console.log('🔄 Running database migrations...')
//     await migrate(db, { migrationsFolder: '/app/drizzle' })
//     console.log('✅ Migrations completed successfully')
//   } catch (error) {
//     console.error('❌ Migration failed:', error)
//     process.exit(1)
//   }
// }

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
    origin: [
     process.env.APP_URL || '', "https://5883-194-33-77-103.ngrok-free.app"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposeHeaders: ["Set-Cookie"],
  }))
  .use(swagger())
  .use(websocketRouter)
  .use(betterAuth)
  .use(roomsRouter)
  .use(notesRouter)
  .get("/", () => "D&D Campaign Manager API")
  .get("/health", () => ({ status: "ok", timestamp: new Date().toISOString() }))
  .get("/user", ({ user }) => user, {
    auth: true,
  }).onStart(async () => {
    if(process.env.NODE_ENV === 'production') {
    console.log("🔄 Running database migrations...");
      await migrate(db, { migrationsFolder: '/app/drizzle' })
      console.log('✅ Migrations completed successfully')
    }
  })
  .listen({
    port: parseInt(process.env.PORT || '4000'),
    hostname: process.env.NODE_ENV === 'production' ? '0.0.0.0' : undefined,
    reusePort: true,
  });

console.log("🦊 Elysia is running at", `${app.server?.hostname}:${app.server?.port}`);
console.log("🔍 Available routes should include /api/auth/* endpoints");

export type App = typeof app;
