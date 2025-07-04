import { inject, injectable } from 'inversify';
import { TYPES } from '../../core/di.types';
import { NotesRepository, type CreateNoteWithSectionsData, type NoteWithSections } from './notes.repository';
import { RoomsService } from '../rooms/rooms.service';
import type { Note, NewNoteSection } from '../../db/schema';

export interface CreateNoteResponse {
  id: string;
  created?: boolean;
  updated?: boolean;
}

export interface UpdateNoteData {
  title?: string;
  obsidianPath?: string;
  sections?: {
    content: string;
    isPublic: boolean;
    orderIndex: number;
  }[];
}

@injectable()
export class NotesService {
  constructor(
    @inject(TYPES.NotesRepository) private readonly notesRepository: NotesRepository,
    @inject(TYPES.RoomsService) private readonly roomsService: RoomsService
  ) {}

  async getNotesByRoomId(roomId: string, userId: string): Promise<NoteWithSections[]> {
    // Check if user is GM to determine visibility
    const isGM = await this.roomsService.isUserRoomGM(roomId, userId);

    // Check if user has access to the room
    const isMember = await this.roomsService.isUserRoomMember(roomId, userId);

    if (!isGM && !isMember) {
      throw new Error('Access denied');
    }

    return await this.notesRepository.findByRoomId(roomId, isGM);
  }

  async createNote(data: CreateNoteWithSectionsData, userId: string): Promise<CreateNoteResponse> {
    // Verify user is GM of the room
    const isGM = await this.roomsService.isUserRoomGM(data.roomId, userId);
    if (!isGM) {
      throw new Error('Only GMs can create notes');
    }

    // Check if note with this obsidian path already exists
    if (data.obsidianPath) {
      const existingNote = await this.notesRepository.findByRoomAndPath(data.roomId, data.obsidianPath);

      if (existingNote) {
        // Update existing note
        await this.notesRepository.updateWithSections(existingNote.id, {
          title: data.title,
          sections: data.sections.map(section => ({
            noteId: existingNote.id,
            content: section.content,
            isPublic: section.isPublic,
            orderIndex: section.orderIndex,
          })),
        });

        return { id: existingNote.id, updated: true };
      }
    }

    // Create new note
    const newNote = await this.notesRepository.create(data);
    return { id: newNote.id, created: true };
  }

  async updateNote(
    roomId: string,
    noteId: string,
    data: UpdateNoteData,
    userId: string
  ): Promise<void> {
    // Verify ownership
    const hasAccess = await this.notesRepository.checkNoteRoomOwnership(noteId, roomId, userId);
    if (!hasAccess) {
      throw new Error('Note not found or access denied');
    }

    const updateData: { title?: string; obsidianPath?: string; sections?: NewNoteSection[] } = {
      title: data.title,
      obsidianPath: data.obsidianPath,
    };

    if (data.sections) {
      updateData.sections = data.sections.map(section => ({
        noteId,
        content: section.content,
        isPublic: section.isPublic,
        orderIndex: section.orderIndex,
      }));
    }

    await this.notesRepository.updateWithSections(noteId, updateData);
  }

  async deleteNote(roomId: string, noteId: string, userId: string): Promise<void> {
    // Verify ownership
    const hasAccess = await this.notesRepository.checkNoteRoomOwnership(noteId, roomId, userId);
    if (!hasAccess) {
      throw new Error('Note not found or access denied');
    }

    await this.notesRepository.delete(noteId);
  }

  async getNoteById(noteId: string): Promise<Note | null> {
    return await this.notesRepository.findById(noteId);
  }
}
