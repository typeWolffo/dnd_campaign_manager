import { inject, injectable } from 'inversify';
import crypto from 'crypto';
import { TYPES } from '../../core/di.types';
import { ImagesRepository, type CreateImageData, type ImageWithMetadata, type ImageMetadata } from './images.repository';
import { uploadImage, getImageData } from '../../lib/s3-client';
import type { NoteImage } from '../../db/schema';

export interface UploadImageData {
  roomId: string;
  noteId: string;
  file: File;
}

export interface UploadedImageResponse {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  size: number;
}

export interface ImageListResponse {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  size: number;
  mimeType: string;
  createdAt: string;
}

export interface ServeImageResponse {
  data: Buffer;
  contentType: string;
  s3Key: string;
}

@injectable()
export class ImagesService {
  constructor(
    @inject(TYPES.ImagesRepository) private readonly imagesRepository: ImagesRepository
  ) {}

  async uploadImage(data: UploadImageData, userId: string): Promise<UploadedImageResponse> {
    const { roomId, noteId, file } = data;

    const hasAccess = await this.imagesRepository.checkNoteAccess(roomId, noteId, userId);
    if (!hasAccess) {
      throw new Error('Access denied');
    }

    if (!file.type.startsWith('image/')) {
      throw new Error(`File ${file.name} is not an image`);
    }

    const ext = file.name.split('.').pop();
    const uniqueId = crypto.randomUUID();
    const filename = `${uniqueId}.${ext}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    const { key } = await uploadImage(roomId, noteId, filename, buffer, file.type);

    const createData: CreateImageData = {
      noteId,
      filename,
      originalName: file.name,
      s3Key: key,
      fileSize: buffer.length,
      mimeType: file.type,
    };

    const imageRecord = await this.imagesRepository.create(createData);

    const proxyUrl = this.generateProxyUrl(imageRecord.id);

    return {
      id: imageRecord.id,
      filename,
      originalName: file.name,
      url: proxyUrl,
      size: buffer.length,
    };
  }

  async uploadMultipleImages(data: UploadImageData[], userId: string): Promise<UploadedImageResponse[]> {
    const results: UploadedImageResponse[] = [];

    for (const imageData of data) {
      try {
        const result = await this.uploadImage(imageData, userId);
        results.push(result);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Error(`Failed to upload ${imageData.file.name}: ${errorMessage}`);
      }
    }

    return results;
  }

  async getImagesByNoteId(roomId: string, noteId: string, userId: string): Promise<ImageListResponse[]> {
    const hasAccess = await this.imagesRepository.checkNoteAccess(roomId, noteId, userId);
    if (!hasAccess) {
      throw new Error('Access denied');
    }

    const images = await this.imagesRepository.findByNoteId(noteId);

    return images.map((image) => ({
      id: image.id,
      filename: image.filename,
      originalName: image.originalName,
      url: this.generateProxyUrl(image.id),
      size: image.fileSize,
      mimeType: image.mimeType,
      createdAt: image.createdAt,
    }));
  }

  async serveImage(imageId: string, userId: string): Promise<ServeImageResponse> {
    const imageMetadata = await this.imagesRepository.findByIdWithPermissionCheck(imageId, userId);

    if (!imageMetadata) {
      throw new Error('Image not found or access denied');
    }

    const { data, contentType } = await getImageData(imageMetadata.s3Key);

    return {
      data,
      contentType: contentType || imageMetadata.mimeType,
      s3Key: imageMetadata.s3Key,
    };
  }

  async getImageUrl(imageId: string, userId: string): Promise<{ url: string }> {
    const imageMetadata = await this.imagesRepository.findByIdWithPermissionCheck(imageId, userId);

    if (!imageMetadata) {
      throw new Error('Image not found or access denied');
    }

    return { url: this.generateProxyUrl(imageId) };
  }

  private generateProxyUrl(imageId: string): string {
    const baseUrl = process.env.API_URL || 'http://localhost:4000';
    return `${baseUrl}/api/images/serve/${imageId}`;
  }
}
