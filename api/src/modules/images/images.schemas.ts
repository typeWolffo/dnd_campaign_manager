import { t } from 'elysia';
import { createInsertSchema, createSelectSchema } from 'drizzle-typebox';
import { noteImages } from '../../db/schema';

// Generate schemas from database tables
export const CreateImageSchema = createInsertSchema(noteImages, {
  id: undefined,
  createdAt: undefined,
  updatedAt: undefined,
});

export const SelectImageSchema = createSelectSchema(noteImages);

// Parameter schemas
export const UploadParamsSchema = t.Object({
  roomId: t.String(),
  noteId: t.String(),
});

export const GetImagesParamsSchema = t.Object({
  roomId: t.String(),
  noteId: t.String(),
});

export const ImageIdParamsSchema = t.Object({
  imageId: t.String(),
});

// Body schemas
export const UploadBodySchema = t.Object({
  files: t.Union([
    t.File(),
    t.Array(t.File())
  ])
});

// Response schemas
export const UploadedImageResponseSchema = t.Object({
  id: t.String(),
  filename: t.String(),
  originalName: t.String(),
  url: t.String(),
  size: t.Number(),
});

export const ImageListResponseSchema = t.Object({
  id: t.String(),
  filename: t.String(),
  originalName: t.String(),
  url: t.String(),
  size: t.Number(),
  mimeType: t.String(),
  createdAt: t.String(),
});

export const UploadSuccessResponseSchema = t.Object({
  success: t.Boolean(),
  images: t.Array(UploadedImageResponseSchema)
});

export const ImagesListResponseSchema = t.Object({
  images: t.Array(ImageListResponseSchema)
});

export const ImageUrlResponseSchema = t.Object({
  url: t.String()
});

export const ErrorResponseSchema = t.Object({
  error: t.String(),
});
