import { S3Client, CreateBucketCommand, HeadBucketCommand, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

console.log('🔧 MinIO Config:', {
  endpoint: process.env.MINIO_ENDPOINT,
  accessKey: process.env.MINIO_ACCESS_KEY?.substring(0, 4) + '...',
  bucket: process.env.MINIO_BUCKET
})

const s3Client = new S3Client({
  endpoint: process.env.MINIO_ENDPOINT,
  region: 'us-east-1', // MinIO doesn't care about region
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY!,
    secretAccessKey: process.env.MINIO_SECRET_KEY!,
  },
  forcePathStyle: true, // Required for MinIO
})

const BUCKET_NAME = process.env.MINIO_BUCKET || 'dnd-images'

export const initializeBucket = async () => {
  try {
    await s3Client.send(new HeadBucketCommand({ Bucket: BUCKET_NAME }))
    console.log(`✅ Bucket ${BUCKET_NAME} exists`)
  } catch (error) {
    console.log(`🔧 Creating bucket ${BUCKET_NAME}`)
    try {
      await s3Client.send(new CreateBucketCommand({ Bucket: BUCKET_NAME }))
      console.log(`✅ Bucket ${BUCKET_NAME} created`)
    } catch (createError) {
      console.error('❌ Failed to create bucket:', createError)
      throw createError
    }
  }
}

export const uploadImage = async (
  roomId: string,
  noteId: string,
  filename: string,
  buffer: Buffer,
  mimeType: string
): Promise<{ key: string; url: string }> => {
  const key = `rooms/${roomId}/notes/${noteId}/${filename}`

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: mimeType,
  })

  await s3Client.send(command)

  const url = await getSignedUrl(s3Client, new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  }), { expiresIn: 3600 }) // 1 hour

  return { key, url }
}

export const getImageUrl = async (key: string): Promise<string> => {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  })

  return await getSignedUrl(s3Client, command, { expiresIn: 3600 })
}

export { s3Client, BUCKET_NAME }
