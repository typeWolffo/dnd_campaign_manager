import 'dotenv/config';
import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { initializeBucket } from "./lib/s3-client";
import { swagger } from "@elysiajs/swagger";
import { auth } from "./auth/config";
import { roomsRouter } from "./routes/rooms";
import { notesRouter } from "./routes/notes";
import { websocketRouter } from "./routes/websocket";
import { imagesRouter } from "./routes/images";
import { apiTokensRouter } from "./routes/api-tokens";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { db } from './db/connection';
import { getAuthFromRequest } from './lib/auth-middleware';


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
  .onError(({ error, code, set }) => {
    // Handle Better Auth specific errors
    if (code === 'NOT_FOUND') {
      set.status = 404;
      return { error: 'Auth endpoint not found' };
    }
    console.error('Better Auth error:', { code, error });
    return { error: 'Authentication error' };
  })
  .macro({
    auth: {
      async resolve({ status, request }) {
        const authSession = await getAuthFromRequest(request);

        if (!authSession) return status(401);

        return {
          user: authSession.user,
          session: authSession.session,
          authType: authSession.authType,
          permissions: authSession.permissions,
        };
      },
    },
  });

console.log("🔐 Better Auth middleware created");

const app = new Elysia({ prefix: "/api" })
  .use(cors({
    origin: [
     process.env.APP_URL || '',
     "app://obsidian.md",
     "http://192.168.1.100:8081"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposeHeaders: ["Set-Cookie"],
  }))
  .use(swagger({
    documentation: {
      info: {
        title: 'D&D Campaign Manager API',
        version: '1.0.0',
        description: 'API for managing D&D campaigns, notes, and rooms'
      },
      tags: [
        { name: 'Notes', description: 'Note management endpoints' },
        { name: 'Rooms', description: 'Room management endpoints' },
        { name: 'Images', description: 'Image management endpoints' },
        { name: 'API Tokens', description: 'API token management endpoints' }
      ]
    },
    swaggerOptions: {
      persistAuthorization: true
    }
  }))
  .use(websocketRouter)
  .use(betterAuth)
  .use(roomsRouter)
  .use(notesRouter)
  .use(imagesRouter)
  .use(apiTokensRouter)
  .get("/", () => "D&D Campaign Manager API")
  .get("/health", () => ({ status: "ok", timestamp: new Date().toISOString() }))
  .get("/user", ({ user }) => user, {
    auth: true,
  })
  // Add session endpoint for plugin compatibility
  .get("/auth/session", ({ user, authType, permissions }) => {
    if (!user) {
      throw new Error("Unauthorized");
    }
    return {
      user,
      authType,
      permissions,
    };
  }, {
    auth: true,
  }).onStart(async () => {
    if(process.env.NODE_ENV === 'production') {
    console.log("🔄 Running database migrations...");
      await migrate(db, { migrationsFolder: '/app/drizzle' })
      console.log('✅ Migrations completed successfully')
    }

    try {
      await initializeBucket()
    } catch (error) {
      console.error('❌ Failed to initialize bucket:', error)
    }
  })
  .listen({
    port: parseInt(process.env.PORT || '4000'),
    hostname: '0.0.0.0',
    reusePort: true,
  });

console.log("🦊 Elysia is running at", `${app.server?.hostname}:${app.server?.port}`);
console.log("🔍 Available routes should include /api/auth/* endpoints");
console.log("🌍 NODE_ENV:", process.env.NODE_ENV);
console.log("🌍 PORT:", process.env.PORT || '4000');

export type App = typeof app;
