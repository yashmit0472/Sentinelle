const { Worker } = require('bullmq')
const IORedis = require('ioredis')
const axios = require('axios')

const VideoJob = require('../models/VideoJob')

const startVideoWorker = () => {
  const connection = new IORedis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null,
  })

  const worker = new Worker(
    'video-processing',
    async (queueJob) => {
      const { videoJobId } = queueJob.data

      console.log(`Processing video job: ${videoJobId}`)

      const videoJob = await VideoJob.findById(videoJobId)

      if (!videoJob) {
        throw new Error('VideoJob not found')
      }

      videoJob.status = 'processing'
      videoJob.progress = 10
      videoJob.startedAt = new Date()
      await videoJob.save()

      const { data } = await axios.post(`${process.env.AI_WORKER_URL}/process`, {
        videoJobId: videoJob._id.toString(),
        bucketName: videoJob.bucketName,
        objectName: videoJob.objectName,
        originalFileName: videoJob.originalFileName,
      })

      videoJob.status = 'completed'
      videoJob.progress = 100
      videoJob.completedAt = new Date()
      videoJob.totalFrames = data.totalFrames || 0
      videoJob.processedFrames = data.processedFrames || 0
      videoJob.flaggedFrames = data.flaggedFrames || 0
      await videoJob.save()

      console.log(`Completed video job: ${videoJobId}`)

      return data
    },
    {
      connection,
    }
  )

  worker.on('failed', async (queueJob, error) => {
    console.error(`Video queue job failed: ${queueJob?.id}`, error.message)

    if (queueJob?.data?.videoJobId) {
      await VideoJob.findByIdAndUpdate(queueJob.data.videoJobId, {
        status: 'failed',
        errorMessage: error.message,
        completedAt: new Date(),
      })
    }
  })

  worker.on('completed', (queueJob) => {
    console.log(`Queue job completed: ${queueJob.id}`)
  })

  console.log('Video processing worker started')
}

module.exports = {
  startVideoWorker,
}