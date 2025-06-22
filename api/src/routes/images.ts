import { Elysia, t, type Context } from 'elysia'
import { uploadImage, getImageUrl } from '../lib/s3-client'
import { db } from '../db/connection'
import { noteImages, notes, roomMembers } from '../db/schema'
import { eq, and } from 'drizzle-orm'
import { auth } from '../auth/config'
import crypto from 'crypto'

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
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    return { auth: session };
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
        const { key, url } = await uploadImage(roomId, noteId, filename, buffer, file.type)

        // Save metadata to database
        const imageRecord = await db.insert(noteImages).values({
          noteId,
          filename,
          originalName: file.name,
          s3Key: key,
          fileSize: buffer.length,
          mimeType: file.type,
        }).returning()

        uploadedImages.push({
          id: imageRecord[0].id,
          filename,
          originalName: file.name,
          url,
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

    // Generate presigned URLs
    const imagesWithUrls = await Promise.all(
      images.map(async (image) => {
        const url = await getImageUrl(image.s3Key)
        return {
          id: image.id,
          filename: image.filename,
          originalName: image.originalName,
          url,
          size: image.fileSize,
          mimeType: image.mimeType,
          createdAt: image.createdAt,
        }
      })
    )

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

    const url = await getImageUrl(image[0].s3Key)
    return { url }
  }, {
    params: ImageUrlParamsSchema
  })
