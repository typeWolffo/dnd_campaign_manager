import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  index,
  varchar,
  uniqueIndex
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name"),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
});

export const accounts = pgTable("accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const verificationTokens = pgTable("verification_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const rooms = pgTable(
  "rooms",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    gmId: uuid("gm_id").references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("rooms_gm_id_idx").on(table.gmId),
  ],
);

export const roomMembers = pgTable(
  "room_members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    roomId: uuid("room_id").references(() => rooms.id, { onDelete: "cascade" }).notNull(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    role: varchar("role", { length: 50 }).notNull().default("player"),
    joinedAt: timestamp("joined_at").defaultNow().notNull(),
  },
  (table) => [
    index("room_members_room_id_idx").on(table.roomId),
    index("room_members_user_id_idx").on(table.userId),
    uniqueIndex("room_members_room_user_unique").on(table.roomId, table.userId),
  ],
);

export const roomInvitations = pgTable(
  "room_invitations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    roomId: uuid("room_id").references(() => rooms.id, { onDelete: "cascade" }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    invitedBy: uuid("invited_by").references(() => users.id, { onDelete: "cascade" }).notNull(),
    status: varchar("status", { length: 50 }).notNull().default("pending"),
    token: varchar("token", { length: 255 }).notNull().unique(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("room_invitations_room_id_idx").on(table.roomId),
    index("room_invitations_email_idx").on(table.email),
    index("room_invitations_token_idx").on(table.token),
  ],
);

export const notes = pgTable(
  "notes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    roomId: uuid("room_id").references(() => rooms.id, { onDelete: "cascade" }).notNull(),
    title: varchar("title", { length: 500 }).notNull(),
    content: text("content").notNull(),
    obsidianPath: varchar("obsidian_path", { length: 1000 }),
    lastSync: timestamp("last_sync"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("notes_room_id_idx").on(table.roomId),
    index("notes_obsidian_path_idx").on(table.obsidianPath),
  ],
);

export const noteSections = pgTable(
  "note_sections",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    noteId: uuid("note_id").references(() => notes.id, { onDelete: "cascade" }).notNull(),
    content: text("content").notNull(),
    isPublic: boolean("is_public").notNull().default(false),
    orderIndex: integer("order_index").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("note_sections_note_id_idx").on(table.noteId),
    index("note_sections_is_public_idx").on(table.isPublic),
    index("note_sections_order_idx").on(table.orderIndex),
  ],
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Room = typeof rooms.$inferSelect;
export type NewRoom = typeof rooms.$inferInsert;

export type RoomMember = typeof roomMembers.$inferSelect;
export type NewRoomMember = typeof roomMembers.$inferInsert;

export type RoomInvitation = typeof roomInvitations.$inferSelect;
export type NewRoomInvitation = typeof roomInvitations.$inferInsert;

export type Note = typeof notes.$inferSelect;
export type NewNote = typeof notes.$inferInsert;

export type NoteSection = typeof noteSections.$inferSelect;
export type NewNoteSection = typeof noteSections.$inferInsert;
