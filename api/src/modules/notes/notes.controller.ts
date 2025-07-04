import Elysia, { t } from 'elysia';
import { NotesService, type UpdateNoteData } from './notes.service';
import { AuthService } from '../auth/auth.service';
import { createAuthPlugin } from '../../core/auth/auth.plugin';
import { broadcastToRoom } from '../../lib/websocket-utils';
import {
  CreateNoteWithSectionsSchema,
  UpdateNoteWithSectionsSchema,
  RoomIdSchema,
  NoteIdSchema,
  CreateNoteResponseSchema,
  NotesResponseSchema,
  ErrorResponseSchema,
  SuccessResponseSchema
} from './notes.schemas';

export const createNotesController = (notesService: NotesService, authService: AuthService) =>
  new Elysia({ prefix: '/rooms', name: 'notes-controller' })
    .use(createAuthPlugin(authService))
    .get('/:roomId/notes', async ({ user, params: { roomId } }) => {
      return await notesService.getNotesByRoomId(roomId, user.id);
    }, {
      auth: true,
      params: RoomIdSchema,
      response: {
        200: NotesResponseSchema,
        401: ErrorResponseSchema,
        403: ErrorResponseSchema,
      },
      detail: {
        tags: ['Notes'],
        summary: 'Get notes',
        description: 'Get all notes for a specific room'
      }
    })
    .post('/:roomId/notes', async ({ user, params: { roomId }, body }) => {
      const result = await notesService.createNote({
        ...body,
        roomId: roomId,
      }, user.id);

      // Broadcast WebSocket event
      broadcastToRoom(roomId, {
        type: "note_update",
        action: result.created ? "created" : "updated",
        noteId: result.id,
      });

      console.log({result});

      return result;
    }, {
      auth: true,
      params: RoomIdSchema,
      body: CreateNoteWithSectionsSchema,
      response: {
        200: CreateNoteResponseSchema,
        401: ErrorResponseSchema,
        403: ErrorResponseSchema
      },
      detail: {
        tags: ['Notes'],
        summary: 'Create note',
        description: 'Create a new note with sections'
      }
    })
    .put('/:roomId/notes/:noteId', async ({ user, params: { roomId, noteId }, body }) => {
      await notesService.updateNote(roomId, noteId, body, user.id);

      // Broadcast WebSocket event
      broadcastToRoom(roomId, {
        type: "note_update",
        action: "updated",
        noteId: noteId,
      });

      return { success: true };
    }, {
      auth: true,
      params: NoteIdSchema,
      body: UpdateNoteWithSectionsSchema,
      response: {
        200: SuccessResponseSchema,
        401: ErrorResponseSchema,
        403: ErrorResponseSchema,
        404: ErrorResponseSchema
      },
      detail: {
        tags: ['Notes'],
        summary: 'Update note',
        description: 'Update an existing note'
      }
    })
    .delete('/:roomId/notes/:noteId', async ({ user, params: { roomId, noteId } }) => {
      await notesService.deleteNote(roomId, noteId, user.id);

      // Broadcast WebSocket event
      broadcastToRoom(roomId, {
        type: "note_update",
        action: "deleted",
        noteId: noteId,
      });

      return { success: true };
    }, {
      auth: true,
      params: NoteIdSchema,
      response: {
        200: SuccessResponseSchema,
        401: ErrorResponseSchema,
        403: ErrorResponseSchema,
        404: ErrorResponseSchema
      },
      detail: {
        tags: ['Notes'],
        summary: 'Delete note',
        description: 'Delete a note'
      }
    });
