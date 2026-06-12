const Minio = require('minio')

const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT,
    port: parseInt(process.env.MINIO_PORT),
    useSSL: false,
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY,
})

const ensureBuckets = async () => {
    const buckets = [
        process.env.MINIO_BUCKET_RAW,
        process.env.MINIO_BUCKET_FRAMES,
    ]

    for (const bucket of buckets) {
        const exists = await minioClient.bucketExists(bucket)
        if (!exists) {
            await minioClient.makeBucket(bucket)
            console.log(`Created bucket: ${bucket}`)
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
    return await minioClient.presignedGetObject(bucket, objectName, expiry)
}

module.exports = { minioClient, ensureBuckets, uploadFile, getSignedUrl }