import { inject, injectable } from 'inversify';
import { TYPES } from '../../core/di.types';
import { RoomsRepository } from './rooms.repository';
import type { Room, NewRoom, RoomMember, RoomWithMembers } from '../../db/schema';

@injectable()
export class RoomsService {
  constructor(
    @inject(TYPES.RoomsRepository) private readonly roomsRepository: RoomsRepository
  ) {}

    async createRoom(data: NewRoom): Promise<Room> {
    const room = await this.roomsRepository.create(data);

    if (room.gmId) {
      await this.roomsRepository.addMember(room.id, room.gmId, 'gm');
    }

    return room;
  }

  async getRoomById(id: string): Promise<RoomWithMembers | null> {
    return await this.roomsRepository.findById(id);
  }

  async getUserRooms(userId: string): Promise<RoomWithMembers[]> {
    return await this.roomsRepository.findByUserId(userId);
  }

  async getRoomMembers(roomId: string): Promise<RoomMember[]> {
    return await this.roomsRepository.findMembersByRoomId(roomId);
  }

  async addMemberToRoom(roomId: string, userId: string, role = 'player'): Promise<RoomMember> {
    return await this.roomsRepository.addMember(roomId, userId, role);
  }

  async removeMemberFromRoom(roomId: string, userId: string): Promise<void> {
    return await this.roomsRepository.removeMember(roomId, userId);
  }

  async updateRoom(id: string, data: Partial<NewRoom>): Promise<Room | null> {
    return await this.roomsRepository.update(id, data);
  }

  async deleteRoom(id: string): Promise<void> {
    return await this.roomsRepository.delete(id);
  }

  async isUserRoomMember(roomId: string, userId: string): Promise<boolean> {
    const members = await this.getRoomMembers(roomId);
    return members.some(member => member.userId === userId);
  }

  async isUserRoomGM(roomId: string, userId: string): Promise<boolean> {
    const room = await this.getRoomById(roomId);
    return room?.gmId === userId;
  }
}
