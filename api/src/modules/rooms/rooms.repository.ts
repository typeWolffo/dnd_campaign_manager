import { and, eq, sql } from 'drizzle-orm';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../core/di.types';
import type { DbInstance } from '../../db/connection';
import { roomMembers, rooms, users, RoomWithMembers, type NewRoom, type Room, type RoomMember, type RoomMemberWithUsername } from '../../db/schema';

@injectable()
export class RoomsRepository {
  constructor(@inject(TYPES.Db) private readonly db: DbInstance) {}

  async create(room: NewRoom): Promise<Room> {
    const [newRoom] = await this.db.insert(rooms).values(room).returning();
    return newRoom;
  }

  async findById(id: string): Promise<RoomWithMembers | null> {
    const [result] = await this.db
      .select({
        id: rooms.id,
        name: rooms.name,
        description: rooms.description,
        gmId: rooms.gmId,
        createdAt: rooms.createdAt,
        updatedAt: rooms.updatedAt,
        isGM: sql<boolean>`${rooms.gmId} = ${roomMembers.userId}`,
        members: sql<RoomMemberWithUsername[]>`
          COALESCE((
            SELECT json_agg(member_data)
            FROM (
              SELECT
                ${roomMembers.id} AS id,
                ${roomMembers.roomId} AS "roomId",
                ${roomMembers.userId} AS "userId",
                ${roomMembers.role} AS "role",
                ${roomMembers.joinedAt} AS "joinedAt",
                ${roomMembers.createdAt} AS "createdAt",
                ${roomMembers.updatedAt} AS "updatedAt",
                ${users.name} AS "userName",
                ${users.email} AS "userEmail"
              FROM ${roomMembers}
              INNER JOIN ${users} ON ${users.id} = ${roomMembers.userId}
              WHERE ${roomMembers.roomId} = ${rooms.id}
              ORDER BY ${roomMembers.joinedAt}
            ) AS member_data
          ), '[]'::json)`,
      })
      .from(rooms)
      .leftJoin(roomMembers, eq(rooms.id, roomMembers.roomId))
      .where(eq(rooms.id, id))
      .limit(1);

    return result || null;
  }

  async findByUserId(userId: string): Promise<RoomWithMembers[]> {
    return await this.db
      .select({
        id: rooms.id,
        name: rooms.name,
        description: rooms.description,
        gmId: rooms.gmId,
        createdAt: rooms.createdAt,
        updatedAt: rooms.updatedAt,
        isGM: sql<boolean>`${rooms.gmId} = ${userId}`,
        members: sql<RoomMemberWithUsername[]>`
          COALESCE((
            SELECT json_agg(member_data)
            FROM (
              SELECT
                ${roomMembers.id} AS id,
                ${roomMembers.roomId} AS "roomId",
                ${roomMembers.userId} AS "userId",
                ${roomMembers.role} AS "role",
                ${roomMembers.joinedAt} AS "joinedAt",
                ${roomMembers.createdAt} AS "createdAt",
                ${roomMembers.updatedAt} AS "updatedAt",
                ${users.name} AS "userName",
                ${users.email} AS "userEmail"
              FROM ${roomMembers}
              INNER JOIN ${users} ON ${users.id} = ${roomMembers.userId}
              WHERE ${roomMembers.roomId} = ${rooms.id}
              ORDER BY ${roomMembers.joinedAt}
            ) AS member_data
          ), '[]'::json)`,
      })
      .from(rooms)
      .innerJoin(roomMembers, eq(rooms.id, roomMembers.roomId))
      .where(eq(roomMembers.userId, userId))
      .groupBy(rooms.id, rooms.name, rooms.description, rooms.gmId, rooms.createdAt, rooms.updatedAt);
  }

  async findMembersByRoomId(roomId: string): Promise<RoomMember[]> {
    return await this.db
      .select()
      .from(roomMembers)
      .where(eq(roomMembers.roomId, roomId));
  }

  async addMember(roomId: string, userId: string, role = 'player'): Promise<RoomMember> {
    const [newMember] = await this.db
      .insert(roomMembers)
      .values({ roomId, userId, role })
      .returning();
    return newMember;
  }

  async removeMember(roomId: string, userId: string): Promise<void> {
    await this.db
      .delete(roomMembers)
      .where(and(eq(roomMembers.roomId, roomId), eq(roomMembers.userId, userId)));
  }

  async update(id: string, data: Partial<NewRoom>): Promise<Room | null> {
    const [updatedRoom] = await this.db
      .update(rooms)
      .set({ ...data, updatedAt: new Date().toISOString() })
      .where(eq(rooms.id, id))
      .returning();
    return updatedRoom || null;
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(rooms).where(eq(rooms.id, id));
  }
}
