import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { openAPI } from "better-auth/plugins";
import { db } from "../db/connection";
import { users, sessions, accounts, verificationTokens } from "../db/schema";

console.log("🔐 Initializing Better Auth...");

const isDev = process.env.NODE_ENV === "development";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: users,
      session: sessions,
      account: accounts,
      verification: verificationTokens,
    },
  }),
  secret: process.env.BETTER_AUTH_SECRET!,
  basePath: "/auth",
  trustedOrigins: [process.env.APP_URL || "", "https://5883-194-33-77-103.ngrok-free.app"],
  advanced: {
    database: {
      generateId: () => crypto.randomUUID(),
    },
    // Only in development - allow JS access to session cookie
    ...(isDev && {
      cookies: {
        session_token: {
          attributes: {
            httpOnly: false,
          },
        },
      },
    }),
  },
  plugins: [
    openAPI(),
  ],
  emailAndPassword: {
    enabled: true,
  },
});

console.log("✅ Better Auth initialized successfully");
console.log("🛣️ Better Auth handler:", typeof auth.handler);
