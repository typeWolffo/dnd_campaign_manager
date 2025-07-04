import { t } from 'elysia';
import { createInsertSchema, createSelectSchema } from 'drizzle-typebox';
import { rooms, roomMembers } from '../../db/schema';

// Generate schemas from database tables
export const CreateRoomSchema = createInsertSchema(rooms, {
  id: undefined,
  createdAt: undefined,
  updatedAt: undefined,
  gmId: undefined,
});

export const UpdateRoomSchema = t.Object({
  name: t.Optional(t.String({ minLength: 1, maxLength: 255 })),
  description: t.Optional(t.Union([t.String(), t.Null()])),
});

export const SelectRoomSchema = createSelectSchema(rooms);

export const RoomMemberSelectSchema = createSelectSchema(roomMembers);

export const RoomMemberWithUsernameSchema = t.Object({
  ...RoomMemberSelectSchema.properties,
  userName: t.String(),
  userEmail: t.String(),
});

// Additional schemas that don't directly map to database tables
export const RoomIdSchema = t.Object({
  roomId: t.String(),
});

export const MemberIdSchema = t.Object({
  memberId: t.String(),
});

export const AddMemberSchema = t.Object({
  userId: t.String(),
  role: t.Optional(t.String()),
});

export const ErrorResponseSchema = t.Object({
  error: t.String(),
});

export const RoomResponseSchema = t.Object({
  ...SelectRoomSchema.properties,
  isGM: t.Boolean(),
  members: t.Array(RoomMemberWithUsernameSchema),
});

export const RoomsResponseSchema = t.Object({
  rooms: t.Array(SelectRoomSchema),
});

export const MembersResponseSchema = t.Array(RoomMemberSelectSchema);

export const MemberResponseSchema = t.Object({
  member: RoomMemberSelectSchema,
});

export const DeleteResponseSchema = t.Object({
  message: t.String(),
});
