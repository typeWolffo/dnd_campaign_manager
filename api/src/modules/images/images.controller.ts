import Elysia, { t } from 'elysia';
import { ImagesService, type UploadImageData } from './images.service';
import { AuthService } from '../auth/auth.service';
import { createAuthPlugin } from '../../core/auth/auth.plugin';
import {
  UploadParamsSchema,
  GetImagesParamsSchema,
  ImageIdParamsSchema,
  UploadBodySchema,
  UploadSuccessResponseSchema,
  ImagesListResponseSchema,
  ImageUrlResponseSchema,
  ErrorResponseSchema
} from './images.schemas';

export const createImagesController = (imagesService: ImagesService, authService: AuthService) =>
  new Elysia({ prefix: '/images', name: 'images-controller' })
    .use(createAuthPlugin(authService))

    .get('/serve/:imageId', async ({ user, params: { imageId }, set }) => {
      try {
        const result = await imagesService.serveImage(imageId, user.id);

        set.headers['Content-Type'] = result.contentType;
        set.headers['Cache-Control'] = 'public, max-age=86400';
        set.headers['ETag'] = `"${result.s3Key}"`;

        return new Response(result.data);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        if (errorMessage.includes('not found') || errorMessage.includes('access denied')) {
          set.status = 404;
        } else {
          set.status = 500;
        }
        return { error: errorMessage };
      }
    }, {
      auth: true,
      params: ImageIdParamsSchema,
      response: {
        404: ErrorResponseSchema,
        500: ErrorResponseSchema
      },
      detail: {
        tags: ['Images'],
        summary: 'Serve image',
        description: 'Serve an image file directly from storage'
      }
    })

    .post('/upload/:roomId/:noteId', async ({ user, params: { roomId, noteId }, body, set }) => {
      const files = Array.isArray(body.files) ? body.files : [body.files];

      // Convert to service format
      const uploadData: UploadImageData[] = files.map(file => ({
        roomId,
        noteId,
        file,
      }));

      try {
        const uploadedImages = await imagesService.uploadMultipleImages(uploadData, user.id);
        return { success: true, images: uploadedImages };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        if (errorMessage.includes('access denied')) {
          set.status = 403;
        } else if (errorMessage.includes('not an image')) {
          set.status = 400;
        } else {
          set.status = 500;
        }
        return { error: errorMessage };
      }
    }, {
      auth: true,
      params: UploadParamsSchema,
      body: UploadBodySchema,
      response: {
        200: UploadSuccessResponseSchema,
        400: ErrorResponseSchema,
        403: ErrorResponseSchema,
        500: ErrorResponseSchema
      },
      detail: {
        tags: ['Images'],
        summary: 'Upload images',
        description: 'Upload one or more images to a note'
      }
    })

    .get('/:roomId/:noteId', async ({ user, params: { roomId, noteId }, set }) => {
      try {
        const images = await imagesService.getImagesByNoteId(roomId, noteId, user.id);
        return { images };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        if (errorMessage.includes('access denied')) {
          set.status = 403;
        } else {
          set.status = 500;
        }
        return { error: errorMessage };
      }
    }, {
      auth: true,
      params: GetImagesParamsSchema,
      response: {
        200: ImagesListResponseSchema,
        403: ErrorResponseSchema,
        500: ErrorResponseSchema
      },
      detail: {
        tags: ['Images'],
        summary: 'Get images',
        description: 'Get all images for a specific note'
      }
    })

    .get('/url/:imageId', async ({ user, params: { imageId }, set }) => {
      try {
        const result = await imagesService.getImageUrl(imageId, user.id);
        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        if (errorMessage.includes('not found') || errorMessage.includes('access denied')) {
          set.status = 404;
        } else {
          set.status = 500;
        }
        return { error: errorMessage };
      }
    }, {
      auth: true,
      params: ImageIdParamsSchema,
      response: {
        200: ImageUrlResponseSchema,
        404: ErrorResponseSchema,
        500: ErrorResponseSchema
      },
      detail: {
        tags: ['Images'],
        summary: 'Get image URL',
        description: 'Get the URL for a specific image'
      }
    });
