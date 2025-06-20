import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./src/db/drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL || "postgresql://postgres:dnd@localhost:5431/dnd"
  },
  verbose: true,
  strict: true,
});
