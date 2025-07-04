import 'reflect-metadata';
import 'dotenv/config';
import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { db } from './db/connection';
import { container } from './core/inversify.config';
import { TYPES } from './core/di.types';
import { AuthService } from './modules/auth/auth.service';
import { createRoomsController } from './modules/rooms/rooms.controller';
import { createNotesController } from './modules/notes/notes.controller';
import { createApiTokensController } from './modules/api-tokens/api-tokens.controller';
import { createImagesController } from './modules/images/images.controller';
import { createWebSocketController } from './modules/websocket/websocket.controller';
import { createAuthPlugin } from './core/auth/auth.plugin';
import { auth } from "./auth/config";
import { initializeBucket } from "./lib/s3-client";

console.log("🚀 Setting up Elysia server with modular architecture...");

const authService = container.get<AuthService>(TYPES.AuthService);

const apiRoutes = new Elysia({ prefix: "/api" })
  .mount(auth.handler)
  .use(createAuthPlugin(authService))
  .use(container.get<() => ReturnType<typeof createWebSocketController>>(TYPES.WebSocketController)())
  .use(container.get<() => ReturnType<typeof createRoomsController>>(TYPES.RoomsController)())
  .use(container.get<() => ReturnType<typeof createNotesController>>(TYPES.NotesController)())
  .use(container.get<() => ReturnType<typeof createApiTokensController>>(TYPES.ApiTokensController)())
  .use(container.get<() => ReturnType<typeof createImagesController>>(TYPES.ImagesController)())
  .get("/", () => "D&D Campaign Manager API (Modular)")
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
  });

const app = new Elysia()
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
      servers: [
        {
          url: '/api',
          description: 'API Server'
        }
      ],
      tags: [
        { name: 'Rooms', description: 'Room management endpoints' },
        { name: 'Notes', description: 'Note management endpoints' },
        { name: 'API Tokens', description: 'API token management endpoints' },
        { name: 'Images', description: 'Image management endpoints' },
        { name: 'WebSocket', description: 'WebSocket connections for real-time updates' },
        { name: 'Auth', description: 'Authentication endpoints' }
      ]
    },
    swaggerOptions: {
      persistAuthorization: true
    }
  }))
  .use(apiRoutes)
  .get("/", () => "D&D Campaign Manager - Redirect to /api for API endpoints")
  .onStart(async () => {
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
console.log("🔍 Swagger UI available at: http://localhost:4000/swagger");
console.log("🔍 Swagger JSON available at: http://localhost:4000/swagger/json");
console.log("🔍 WebSocket available at: ws://localhost:4000/api/ws");
console.log("🌍 NODE_ENV:", process.env.NODE_ENV);
console.log("🌍 PORT:", process.env.PORT || '4000');

export type App = typeof app;
