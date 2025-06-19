import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { openAPI } from "better-auth/plugins";
import { db } from "../db/connection";
import { users, sessions, accounts, verificationTokens } from "../db/schema";

console.log("🔐 Initializing Better Auth...");

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
  trustedOrigins: ["http://localhost:5173"],
  advanced: {
    database: {
      generateId: () => crypto.randomUUID(),
    },
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
