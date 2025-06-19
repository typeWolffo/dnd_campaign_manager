import { Type, Static } from "@sinclair/typebox";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-typebox";
import { rooms, roomMembers } from "../db/schema";

export const CreateRoomSchema = createInsertSchema(rooms, {
  id: undefined,
  gmId: undefined,
  createdAt: undefined,
  updatedAt: undefined,
});

export const UpdateRoomSchema = createUpdateSchema(rooms, {
  id: undefined,
  gmId: undefined,
  createdAt: undefined,
  updatedAt: undefined,
});

export const SelectRoomSchema = createSelectSchema(rooms);

export const AddMemberSchema = Type.Object({
  email: Type.String({
    pattern: "^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$",
    minLength: 5
  }),
  role: Type.Optional(Type.Union([
    Type.Literal("player"),
    Type.Literal("gm")
  ], { default: "player" })),
});

export const RoomIdSchema = Type.Object({
  id: Type.String(),
});

export const MemberIdSchema = Type.Object({
  memberId: Type.String(),
});

export type CreateRoomType = Static<typeof CreateRoomSchema>;
export type UpdateRoomType = Static<typeof UpdateRoomSchema>;
export type SelectRoomType = Static<typeof SelectRoomSchema>;
export type AddMemberType = Static<typeof AddMemberSchema>;
export type RoomIdType = Static<typeof RoomIdSchema>;
export type MemberIdType = Static<typeof MemberIdSchema>;
