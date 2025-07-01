import { t } from "elysia";

export const roomSchema = t.Object({
  id: t.String(),
  name: t.String(),
  description: t.Union([t.String(), t.Null()]),
  gmId: t.Union([t.String(), t.Null()]),
  createdAt: t.String(),
  updatedAt: t.String(),
  isGM: t.Boolean(),
  members: t.Array(t.Object({
    id: t.String(),
    userId: t.String(),
    role: t.String(),
    joinedAt: t.String(),
    userName: t.Union([t.String(), t.Null()]),
    userEmail: t.String(),
  })),
});
