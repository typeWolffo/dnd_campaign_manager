import { inject, injectable } from 'inversify';
import { eq, and } from 'drizzle-orm';
import { noteImages, notes, roomMembers, type NoteImage, type NewNoteImage } from '../../db/schema';
import { TYPES } from '../../core/di.types';
import type { DbInstance } from '../../db/connection';

export interface CreateImageData {
  noteId: string;
  filename: string;
  originalName: string;
  s3Key: string;
  fileSize: number;
  mimeType: string;
}

export interface ImageWithMetadata extends NoteImage {
  url: string;
}

export interface ImageMetadata {
  s3Key: string;
  mimeType: string;
  noteId: string;
}

@injectable()
export class ImagesRepository {
  constructor(@inject(TYPES.Db) private readonly db: DbInstance) {}

  async create(data: CreateImageData): Promise<NoteImage> {
    const [newImage] = await this.db
      .insert(noteImages)
      .values({
        noteId: data.noteId,
        filename: data.filename,
        originalName: data.originalName,
        s3Key: data.s3Key,
        fileSize: data.fileSize,
        mimeType: data.mimeType,
      })
      .returning();

    return newImage;
  }

  async findByNoteId(noteId: string): Promise<NoteImage[]> {
    return await this.db
      .select()
      .from(noteImages)
      .where(eq(noteImages.noteId, noteId));
  }

  async findByIdWithPermissionCheck(imageId: string, userId: string): Promise<ImageMetadata | null> {
    const [image] = await this.db
      .select({
        s3Key: noteImages.s3Key,
        mimeType: noteImages.mimeType,
        noteId: noteImages.noteId,
      })
      .from(noteImages)
      .innerJoin(notes, eq(notes.id, noteImages.noteId))
      .innerJoin(roomMembers, and(
        eq(roomMembers.roomId, notes.roomId),
        eq(roomMembers.userId, userId)
      ))
      .where(eq(noteImages.id, imageId))
      .limit(1);

    return image || null;
  }

  async checkNoteAccess(roomId: string, noteId: string, userId: string): Promise<boolean> {
    const [membership] = await this.db
      .select()
      .from(roomMembers)
      .where(and(
        eq(roomMembers.roomId, roomId),
        eq(roomMembers.userId, userId)
      ))
      .limit(1);

    return !!membership;
  }

  async delete(imageId: string, userId: string): Promise<boolean> {
    const [deleted] = await this.db
      .delete(noteImages)
      .where(and(
        eq(noteImages.id, imageId),
        // TODO: Verify user has access through room membership
      ))
      .returning({ id: noteImages.id });

    return !!deleted;
  }
}
