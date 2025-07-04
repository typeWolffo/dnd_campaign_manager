import Elysia, { t } from 'elysia';
import { RoomsService } from './rooms.service';
import { AuthService } from '../auth/auth.service';
import { createAuthPlugin } from '../../core/auth/auth.plugin';
import {
  CreateRoomSchema,
  UpdateRoomSchema,
  RoomIdSchema,
  MemberIdSchema,
  AddMemberSchema,
  SelectRoomSchema,
  RoomMemberSelectSchema,
  RoomResponseSchema,
  RoomsResponseSchema,
  MembersResponseSchema,
  MemberResponseSchema,
  DeleteResponseSchema,
  ErrorResponseSchema
} from './rooms.schemas';

export const createRoomsController = (roomsService: RoomsService, authService: AuthService) =>
  new Elysia({ prefix: '/rooms', name: 'rooms-controller' })
    .use(createAuthPlugin(authService))
    .get('/', async ({ user }) => {
      const rooms = await roomsService.getUserRooms(user.id);
      return rooms;
    }, {
      auth: true,
      response: {
        200: t.Array(RoomResponseSchema),
        401: ErrorResponseSchema,
      },
      detail: {
        tags: ['Rooms'],
        summary: 'Get user rooms',
        description: 'Get all rooms for the authenticated user'
      }
    })
    .post('/', async ({ body, user }) => {
      const room = await roomsService.createRoom({
        ...body,
        gmId: user.id,
      });
      return room;
    }, {
      auth: true,
      body: CreateRoomSchema,
      response: {
        201: SelectRoomSchema,
        401: ErrorResponseSchema,
      },
      detail: {
        tags: ['Rooms'],
        summary: 'Create room',
        description: 'Create a new room'
      }
    })
    .get('/:roomId', async ({ params, user }) => {
      const room = await roomsService.getRoomById(params.roomId);
      if (!room) {
        throw new Error('Room not found');
      }

      const isMember = await roomsService.isUserRoomMember(params.roomId, user.id);
      if (!isMember) {
        throw new Error('Access denied');
      }

      return  room ;
    }, {
      auth: true,
      params: RoomIdSchema,
      response: {
        200: RoomResponseSchema,
        401: ErrorResponseSchema,
        403: ErrorResponseSchema,
        404: ErrorResponseSchema,
      },
      detail: {
        tags: ['Rooms'],
        summary: 'Get room',
        description: 'Get a specific room by ID'
      }
    })
    .patch('/:roomId', async ({ params, body, user }) => {
      const isGM = await roomsService.isUserRoomGM(params.roomId, user.id);
      if (!isGM) {
        throw new Error('Only GM can update room');
      }

      const room = await roomsService.updateRoom(params.roomId, body);
      if (!room) {
        throw new Error('Room not found');
      }

      return room;
    }, {
      auth: true,
      params: RoomIdSchema,
      body: UpdateRoomSchema,
      response: {
        200: SelectRoomSchema,
        401: ErrorResponseSchema,
        403: ErrorResponseSchema,
        404: ErrorResponseSchema,
      },
      detail: {
        tags: ['Rooms'],
        summary: 'Update room',
        description: 'Update room details (GM only)'
      }
    })
    .delete('/:roomId', async ({ params, user }) => {
      const isGM = await roomsService.isUserRoomGM(params.roomId, user.id);
      if (!isGM) {
        throw new Error('Only GM can delete room');
      }

      await roomsService.deleteRoom(params.roomId);
      return { message: 'Room deleted successfully' };
    }, {
      auth: true,
      params: RoomIdSchema,
      response: {
        200: DeleteResponseSchema,
        401: ErrorResponseSchema,
        403: ErrorResponseSchema,
        404: ErrorResponseSchema,
      },
      detail: {
        tags: ['Rooms'],
        summary: 'Delete room',
        description: 'Delete a room (GM only)'
      }
    })

    .get('/:roomId/members', async ({ params, user }) => {
      const isMember = await roomsService.isUserRoomMember(params.roomId, user.id);
      if (!isMember) {
        throw new Error('Access denied');
      }

      return await roomsService.getRoomMembers(params.roomId);
    }, {
      auth: true,
      params: RoomIdSchema,
      response: {
        200: MembersResponseSchema,
        401: ErrorResponseSchema,
        403: ErrorResponseSchema,
      },
      detail: {
        tags: ['Rooms'],
        summary: 'Get room members',
        description: 'Get all members of a specific room'
      }
    })
    .post('/:roomId/members', async ({ params, body, user }) => {
      const isGM = await roomsService.isUserRoomGM(params.roomId, user.id);
      if (!isGM) {
        throw new Error('Only GM can add members');
      }

      return await roomsService.addMemberToRoom(params.roomId, body.userId, body.role);
    }, {
      auth: true,
      params: RoomIdSchema,
      body: AddMemberSchema,
      response: {
        201: MemberResponseSchema,
        401: ErrorResponseSchema,
        403: ErrorResponseSchema,
      },
      detail: {
        tags: ['Rooms'],
        summary: 'Add room member',
        description: 'Add a new member to the room (GM only)'
      }
    })

    .delete('/:roomId/members/:memberId', async ({ params, user }) => {
      const isGM = await roomsService.isUserRoomGM(params.roomId, user.id);
      if (!isGM) {
        throw new Error('Only GM can remove members');
      }

      await roomsService.removeMemberFromRoom(params.roomId, params.memberId);
      return { message: 'Member removed successfully' };
    }, {
      auth: true,
      params: t.Intersect([RoomIdSchema, MemberIdSchema]),
      response: {
        200: DeleteResponseSchema,
        401: ErrorResponseSchema,
        403: ErrorResponseSchema,
      },
      detail: {
        tags: ['Rooms'],
        summary: 'Remove room member',
        description: 'Remove a member from the room (GM only)'
      }
    });
