import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

export const s3Client = new S3Client()

const BUCKET = process.env.S3_BUCKET_NAME || "bhupeshb7-storage"

export const createUploadSignedUrl = async ({
  key,
  contentType,
}) => {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  })

  return await getSignedUrl(s3Client, command, {
    expiresIn: 600,
    signableHeaders: new Set(["Content-Type"]),
  })
}

export const createGetSignedUrl = async ({
  key,
  download = false,
  filename,
}) => {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ResponseContentDisposition: `${download ? "attachment" : "inline"}; filename=${encodeURIComponent(
      filename
    )}`,
  })

  return await getSignedUrl(s3Client, command, {
    expiresIn: 300,
  })
}

export const getS3FileMetaData = async (key) => {
  const command = new HeadObjectCommand({
    Bucket: BUCKET,
    Key: key,
  })

  return await s3Client.send(command)
}

export const deleteS3File = async (key) => {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET,
    Key: key,
  })

  await s3Client.send(command)
}

export const safeDeleteS3File = async (key) => {
  try {
    await getS3FileMetaData(key)
    await deleteS3File(key)
  } catch (error) {
    if (error?.$metadata?.httpStatusCode === 404) return
    throw error
  }
}
