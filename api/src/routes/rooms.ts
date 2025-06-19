import { Elysia, t, type Context } from "elysia";
import { db } from "../db/connection";
import { rooms, roomMembers, users } from "../db/schema";
import { CreateRoomSchema, UpdateRoomSchema, AddMemberSchema, RoomIdSchema, MemberIdSchema } from "../types/rooms";
import { eq, and, or, ilike, ne, sql } from "drizzle-orm";
import { auth } from "../auth/config";

export const roomsRouter = new Elysia({ prefix: "/rooms" })
  .derive(async ({ request }: Context) => {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    return { auth: session };
  })

  .get("/", async ({ auth }) => {
    if (!auth?.user) {
      throw new Error("Unauthorized");
    }

    const gmRooms = await db
      .select({
        id: rooms.id,
        name: rooms.name,
        description: rooms.description,
        gmId: rooms.gmId,
        createdAt: rooms.createdAt,
        updatedAt: rooms.updatedAt,
        role: sql<string>`'gm'`.as('role'),
        isGM: sql<boolean>`true`.as('isGM'),
      })
      .from(rooms)
      .where(eq(rooms.gmId, auth.user.id));

    const memberRooms = await db
      .select({
        id: rooms.id,
        name: rooms.name,
        description: rooms.description,
        gmId: rooms.gmId,
        createdAt: rooms.createdAt,
        updatedAt: rooms.updatedAt,
        role: roomMembers.role,
        isGM: sql<boolean>`false`.as('isGM'),
      })
      .from(rooms)
      .innerJoin(roomMembers, eq(roomMembers.roomId, rooms.id))
      .where(
        and(
          eq(roomMembers.userId, auth.user.id),
          ne(rooms.gmId, auth.user.id)
        )
      );

    const userRooms = [...gmRooms, ...memberRooms];

    return userRooms;
  })

  .get("/:id", async ({ params, auth }) => {
    if (!auth?.user) {
      throw new Error("Unauthorized");
    }

    const room = await db
      .select()
      .from(rooms)
      .where(eq(rooms.id, params.id))
      .limit(1);

    if (!room[0]) {
      throw new Error("Room not found");
    }

    const hasAccess = await db
      .select()
      .from(roomMembers)
      .where(
        and(
          eq(roomMembers.roomId, params.id),
          eq(roomMembers.userId, auth.user.id)
        )
      )
      .limit(1);

    const isGM = room[0].gmId === auth.user.id;

    if (!isGM && !hasAccess[0]) {
      throw new Error("Access denied");
    }

    const members = await db
      .select({
        id: roomMembers.id,
        userId: roomMembers.userId,
        role: roomMembers.role,
        joinedAt: roomMembers.joinedAt,
        userName: users.name,
        userEmail: users.email,
      })
      .from(roomMembers)
      .innerJoin(users, eq(users.id, roomMembers.userId))
      .where(eq(roomMembers.roomId, params.id));

    return {
      ...room[0],
      members,
      isGM,
    };
  }, {
    params: RoomIdSchema,
  })

  .post("/", async ({ body, auth }) => {
    if (!auth?.user) {
      throw new Error("Unauthorized");
    }

    const newRoom = await db
      .insert(rooms)
      .values({
        name: body.name,
        description: body.description,
        gmId: auth.user.id,
      })
      .returning();

    await db.insert(roomMembers).values({
      roomId: newRoom[0].id,
      userId: auth.user.id,
      role: "gm",
    });

    return newRoom[0];
  }, {
    body: CreateRoomSchema,
  })

  .patch("/:id", async ({ params, body, auth }) => {
    if (!auth?.user) {
      throw new Error("Unauthorized");
    }

    const room = await db
      .select()
      .from(rooms)
      .where(eq(rooms.id, params.id))
      .limit(1);

    if (!room[0]) {
      throw new Error("Room not found");
    }

    if (room[0].gmId !== auth.user.id) {
      throw new Error("Only GM can update room");
    }

    const updatedRoom = await db
      .update(rooms)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(eq(rooms.id, params.id))
      .returning();

    return updatedRoom[0];
  }, {
    params: RoomIdSchema,
    body: UpdateRoomSchema,
  })

  .delete("/:id", async ({ params, auth }) => {
    if (!auth?.user) {
      throw new Error("Unauthorized");
    }

    const room = await db
      .select()
      .from(rooms)
      .where(eq(rooms.id, params.id))
      .limit(1);

    if (!room[0]) {
      throw new Error("Room not found");
    }

    if (room[0].gmId !== auth.user.id) {
      throw new Error("Only GM can delete room");
    }

    await db.delete(rooms).where(eq(rooms.id, params.id));

    return { success: true };
  }, {
    params: RoomIdSchema,
  })

  .post("/:id/members", async ({ params, body, auth }) => {
    if (!auth?.user) {
      throw new Error("Unauthorized");
    }

    const room = await db
      .select()
      .from(rooms)
      .where(eq(rooms.id, params.id))
      .limit(1);

    if (!room[0]) {
      throw new Error("Room not found");
    }

    if (room[0].gmId !== auth.user.id) {
      throw new Error("Only GM can add members");
    }

    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, body.email))
      .limit(1);

    if (!user[0]) {
      throw new Error("User not found with this email");
    }

    const existingMember = await db
      .select()
      .from(roomMembers)
      .where(
        and(
          eq(roomMembers.roomId, params.id),
          eq(roomMembers.userId, user[0].id)
        )
      )
      .limit(1);

    if (existingMember[0]) {
      throw new Error("User is already a member of this room");
    }

    const newMember = await db
      .insert(roomMembers)
      .values({
        roomId: params.id,
        userId: user[0].id,
        role: body.role || "player",
      })
      .returning();

    return {
      ...newMember[0],
      userName: user[0].name,
      userEmail: user[0].email,
    };
  }, {
    params: RoomIdSchema,
    body: AddMemberSchema,
  })

  .delete("/:id/members/:memberId", async ({ params, auth }) => {
    if (!auth?.user) {
      throw new Error("Unauthorized");
    }

    const room = await db
      .select()
      .from(rooms)
      .where(eq(rooms.id, params.id))
      .limit(1);

    if (!room[0]) {
      throw new Error("Room not found");
    }

    if (room[0].gmId !== auth.user.id) {
      throw new Error("Only GM can remove members");
    }

    const member = await db
      .select()
      .from(roomMembers)
      .where(eq(roomMembers.id, params.memberId))
      .limit(1);

    if (!member[0]) {
      throw new Error("Member not found");
    }

    if (member[0].userId === auth.user.id) {
      throw new Error("GM cannot remove themselves from the room");
    }

    await db.delete(roomMembers).where(eq(roomMembers.id, params.memberId));

    return { success: true };
  }, {
    params: t.Object({
      id: t.String(),
      memberId: t.String(),
    }),
  })

  .get("/search/users", async ({ query, auth }) => {
    if (!auth?.user) {
      throw new Error("Unauthorized");
    }

    if (!query.email || query.email.length < 3) {
      return [];
    }

    const foundUsers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
      })
      .from(users)
      .where(
        and(
          ilike(users.email, `%${query.email}%`),
          ne(users.id, auth.user.id)
        )
      )
      .limit(10);

    return foundUsers;
  }, {
    query: t.Object({
      email: t.String(),
    }),
  });
