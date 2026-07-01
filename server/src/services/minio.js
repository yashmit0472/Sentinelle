const Minio = require('minio')

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT,
  port: parseInt(process.env.MINIO_PORT, 10),
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
})

const ensureBuckets = async () => {
  const buckets = [
    process.env.MINIO_BUCKET_RAW,
    process.env.MINIO_BUCKET_FRAMES,
    process.env.MINIO_BUCKET_REPORTS,
  ].filter(Boolean)

  for (const bucket of buckets) {
    const exists = await minioClient.bucketExists(bucket)

    if (!exists) {
      await minioClient.makeBucket(bucket)
      console.log(`Created bucket: ${bucket}`)
    } else {
      console.log(`Bucket already exists: ${bucket}`)
    }
  }
}

const uploadFile = async (bucket, objectName, filePath, contentType) => {
  await minioClient.fPutObject(bucket, objectName, filePath, {
    'Content-Type': contentType,
  })

  return objectName
}

const getSignedUrl = async (bucket, objectName, expiry = 3600) => {
  let url = await minioClient.presignedGetObject(
    bucket,
    objectName,
    expiry
  )

  url = url.replace(
    'http://minio:9000',
    'http://localhost:9000'
  )

  return url
}

const listObjects = async (bucket, prefix) => {
  return new Promise((resolve, reject) => {
    const objects = []

    const stream = minioClient.listObjects(
      bucket,
      prefix,
      true
    )

    stream.on('data', (obj) => {
      objects.push(obj)
    })

    stream.on('error', reject)

    stream.on('end', () => {
      resolve(objects)
    })
  })
}

const streamObject = async (bucket, objectName) => {
  return await minioClient.getObject(bucket, objectName)
}

module.exports = {
  minioClient,
  ensureBuckets,
  uploadFile,
  getSignedUrl,
  listObjects,
  streamObject,
}