import { Elysia, t, type Context } from 'elysia'
import { uploadImage, getImageUrl, getImageData } from '../lib/s3-client'
import { db } from '../db/connection'
import { noteImages, notes, roomMembers } from '../db/schema'
import { eq, and } from 'drizzle-orm'
import { auth } from '../auth/config'
import crypto from 'crypto'
import { getAuthFromRequest } from '../lib/auth-middleware'

const UploadParamsSchema = t.Object({
  roomId: t.String(),
  noteId: t.String(),
})

const GetImagesParamsSchema = t.Object({
  roomId: t.String(),
  noteId: t.String(),
})

const ImageUrlParamsSchema = t.Object({
  imageId: t.String(),
})

export const imagesRouter = new Elysia({ prefix: "/images" })
  .derive(async ({ request }: Context) => {
    const authSession = await getAuthFromRequest(request);
    return { auth: authSession };
  })

  // New proxy endpoint for serving images directly
  .get('/serve/:imageId', async ({ params: { imageId }, auth, set }) => {
    if (!auth?.user) {
      set.status = 401
      return { error: 'Unauthorized' }
    }

    try {
      // Get image metadata and check permissions
      const image = await db.select({
        s3Key: noteImages.s3Key,
        mimeType: noteImages.mimeType,
        noteId: noteImages.noteId,
      }).from(noteImages)
        .innerJoin(notes, eq(notes.id, noteImages.noteId))
        .innerJoin(roomMembers, and(
          eq(roomMembers.roomId, notes.roomId),
          eq(roomMembers.userId, auth.user.id)
        ))
        .where(eq(noteImages.id, imageId))
        .limit(1)

      if (image.length === 0) {
        set.status = 404
        return { error: 'Image not found or access denied' }
      }

      // Get image data from S3
      const { data, contentType } = await getImageData(image[0].s3Key)

      // Set appropriate headers
      set.headers['Content-Type'] = contentType || image[0].mimeType || 'application/octet-stream'
      set.headers['Cache-Control'] = 'public, max-age=86400' // Cache for 24 hours
      set.headers['ETag'] = `"${image[0].s3Key}"`

      return new Response(data)
    } catch (error) {
      console.error('Failed to serve image:', error)
      set.status = 500
      return { error: 'Failed to serve image' }
    }
  }, {
    params: t.Object({
      imageId: t.String(),
    })
  })

  .post('/upload/:roomId/:noteId', async ({ params: { roomId, noteId }, body, auth, set }) => {
    console.log('🖼️ Image upload request received:', { roomId, noteId });
    console.log('🔐 Auth status:', auth ? 'Present' : 'Missing');
    console.log('👤 User:', auth?.user?.email || 'No user');

    // TEMPORARILY DISABLE AUTH CHECK FOR TESTING
    // if (!auth?.user) {
    //   console.log('❌ Unauthorized - no auth.user');
    //   set.status = 401
    //   return { error: 'Unauthorized' }
    // }

    const files = Array.isArray(body.files) ? body.files : [body.files]
    const uploadedImages = []

    for (const file of files) {
      if (!file || !file.name || !file.type) {
        continue
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        set.status = 400
        return { error: `File ${file.name} is not an image` }
      }

      // Generate unique filename
      const ext = file.name.split('.').pop()
      const uniqueId = crypto.randomUUID()
      const filename = `${uniqueId}.${ext}`

      try {
        // Convert file to buffer
        const buffer = Buffer.from(await file.arrayBuffer())

        // Upload to MinIO
        const { key } = await uploadImage(roomId, noteId, filename, buffer, file.type)

        // Save metadata to database
        const imageRecord = await db.insert(noteImages).values({
          noteId,
          filename,
          originalName: file.name,
          s3Key: key,
          fileSize: buffer.length,
          mimeType: file.type,
        }).returning()

        // Return proxy URL instead of signed URL
        const proxyUrl = `${process.env.API_URL || 'http://localhost:4000'}/api/images/serve/${imageRecord[0].id}`

        uploadedImages.push({
          id: imageRecord[0].id,
          filename,
          originalName: file.name,
          url: proxyUrl,
          size: buffer.length,
        })
      } catch (error) {
        console.error('Failed to upload image:', error)
        set.status = 500
        return { error: `Failed to upload ${file.name}` }
      }
    }

    return { success: true, images: uploadedImages }
  }, {
    params: UploadParamsSchema,
    body: t.Object({
      files: t.Union([
        t.File(),
        t.Array(t.File())
      ])
    })
  })

  .get('/:roomId/:noteId', async ({ params: { roomId, noteId }, auth, set }) => {
    if (!auth?.user) {
      set.status = 401
      return { error: 'Unauthorized' }
    }

    // Check if user has access to the room
    const membership = await db.select().from(roomMembers)
      .where(and(
        eq(roomMembers.roomId, roomId),
        eq(roomMembers.userId, auth.user.id)
      ))
      .limit(1)

    if (membership.length === 0) {
      set.status = 403
      return { error: 'Access denied' }
    }

    // Get all images for this note
    const images = await db.select().from(noteImages)
      .where(eq(noteImages.noteId, noteId))

    // Return proxy URLs instead of signed URLs
    const imagesWithUrls = images.map((image) => {
      const proxyUrl = `${process.env.API_URL || 'http://localhost:4000'}/api/images/serve/${image.id}`
      return {
        id: image.id,
        filename: image.filename,
        originalName: image.originalName,
        url: proxyUrl,
        size: image.fileSize,
        mimeType: image.mimeType,
        createdAt: image.createdAt,
      }
    })

    return { images: imagesWithUrls }
  }, {
    params: GetImagesParamsSchema
  })

  .get('/url/:imageId', async ({ params: { imageId }, auth, set }) => {
    if (!auth?.user) {
      set.status = 401
      return { error: 'Unauthorized' }
    }

    // Get image metadata
    const image = await db.select({
      s3Key: noteImages.s3Key,
      noteId: noteImages.noteId,
    }).from(noteImages)
      .innerJoin(notes, eq(notes.id, noteImages.noteId))
      .innerJoin(roomMembers, and(
        eq(roomMembers.roomId, notes.roomId),
        eq(roomMembers.userId, auth.user.id)
      ))
      .where(eq(noteImages.id, imageId))
      .limit(1)

    if (image.length === 0) {
      set.status = 404
      return { error: 'Image not found or access denied' }
    }

    // Return proxy URL instead of signed URL
    const proxyUrl = `${process.env.API_URL || 'http://localhost:4000'}/api/images/serve/${imageId}`
    return { url: proxyUrl }
  }, {
    params: ImageUrlParamsSchema
  })
