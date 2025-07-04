import { inject, injectable } from 'inversify';
import { eq, and, desc } from 'drizzle-orm';
import { notes, noteSections, rooms, roomMembers, type Note, type NewNote, type NoteSection, type NewNoteSection } from '../../db/schema';
import { TYPES } from '../../core/di.types';
import type { DbInstance } from '../../db/connection';

export interface NoteWithSections extends Note {
  sections: NoteSection[];
}

export interface CreateNoteWithSectionsData {
  title: string;
  roomId: string;
  obsidianPath?: string;
  sections: {
    content: string;
    isPublic: boolean;
    orderIndex: number;
  }[];
}

@injectable()
export class NotesRepository {
  constructor(@inject(TYPES.Db) private readonly db: DbInstance) {}

  async findByRoomId(roomId: string, userIsGM = false): Promise<NoteWithSections[]> {
    const roomNotes = await this.db
      .select({
        id: notes.id,
        title: notes.title,
        obsidianPath: notes.obsidianPath,
        lastSync: notes.lastSync,
        createdAt: notes.createdAt,
        updatedAt: notes.updatedAt,
        roomId: notes.roomId,
        content: notes.content,
        sectionId: noteSections.id,
        sectionContent: noteSections.content,
        isPublic: noteSections.isPublic,
        orderIndex: noteSections.orderIndex,
        sectionCreatedAt: noteSections.createdAt,
      })
      .from(notes)
      .leftJoin(noteSections, eq(noteSections.noteId, notes.id))
      .where(eq(notes.roomId, roomId))
      .orderBy(desc(notes.updatedAt), noteSections.orderIndex);

    const notesMap = new Map<string, NoteWithSections>();

    for (const row of roomNotes) {
      if (!row.id) continue;

      if (!notesMap.has(row.id)) {
        notesMap.set(row.id, {
          id: row.id,
          title: row.title,
          content: row.content,
          obsidianPath: row.obsidianPath,
          lastSync: row.lastSync,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
          roomId: row.roomId,
          sections: [],
        });
      }

      if (row.sectionId && (userIsGM || row.isPublic)) {
        notesMap.get(row.id)!.sections.push({
          id: row.sectionId,
          noteId: row.id,
          content: row.sectionContent!,
          isPublic: row.isPublic!,
          orderIndex: row.orderIndex!,
          createdAt: row.sectionCreatedAt!,
          updatedAt: row.sectionCreatedAt!, // Use same as createdAt for now
        });
      }
    }

    return Array.from(notesMap.values());
  }

  async findById(noteId: string): Promise<Note | null> {
    const [note] = await this.db
      .select()
      .from(notes)
      .where(eq(notes.id, noteId))
      .limit(1);

    return note || null;
  }

  async findByRoomAndPath(roomId: string, obsidianPath: string): Promise<Note | null> {
    const [note] = await this.db
      .select()
      .from(notes)
      .where(and(
        eq(notes.roomId, roomId),
        eq(notes.obsidianPath, obsidianPath)
      ))
      .limit(1);

    return note || null;
  }

  async create(data: CreateNoteWithSectionsData): Promise<Note> {
    const [newNote] = await this.db
      .insert(notes)
      .values({
        roomId: data.roomId,
        title: data.title,
        content: "",
        obsidianPath: data.obsidianPath,
        lastSync: new Date().toISOString(),
      })
      .returning();

    if (data.sections.length > 0) {
      await this.db
        .insert(noteSections)
        .values(data.sections.map(section => ({
          noteId: newNote.id,
          content: section.content,
          isPublic: section.isPublic,
          orderIndex: section.orderIndex,
        })));
    }

    return newNote;
  }

  async update(noteId: string, data: Partial<NewNote>): Promise<Note | null> {
    const [updatedNote] = await this.db
      .update(notes)
      .set({
        ...data,
        lastSync: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(notes.id, noteId))
      .returning();

    return updatedNote || null;
  }

  async updateWithSections(noteId: string, data: { title?: string; obsidianPath?: string; sections?: NewNoteSection[] }): Promise<Note | null> {
    const [updatedNote] = await this.db
      .update(notes)
      .set({
        ...(data.title && { title: data.title }),
        ...(data.obsidianPath && { obsidianPath: data.obsidianPath }),
        lastSync: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(notes.id, noteId))
      .returning();

    if (data.sections) {
      await this.db
        .delete(noteSections)
        .where(eq(noteSections.noteId, noteId));

      if (data.sections.length > 0) {
        await this.db
          .insert(noteSections)
          .values(data.sections.map(section => ({
            noteId,
            content: section.content,
            isPublic: section.isPublic,
            orderIndex: section.orderIndex,
          })));
      }
    }

    return updatedNote || null;
  }

  async delete(noteId: string): Promise<void> {
    await this.db.delete(notes).where(eq(notes.id, noteId));
  }

  async checkNoteRoomOwnership(noteId: string, roomId: string, userId: string): Promise<boolean> {
    const [result] = await this.db
      .select()
      .from(notes)
      .innerJoin(rooms, eq(rooms.id, notes.roomId))
      .where(and(
        eq(notes.id, noteId),
        eq(notes.roomId, roomId),
        eq(rooms.gmId, userId)
      ))
      .limit(1);

    return !!result;
  }
}
