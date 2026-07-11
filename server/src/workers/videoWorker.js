const { Worker } = require('bullmq')
const IORedis = require('ioredis')
const axios = require('axios')

const VideoJob = require('../models/VideoJob')
const Incident = require('../models/Incident')

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
      videoJob.errorMessage = undefined
      await videoJob.save()

      const { data } = await axios.post(
        `${process.env.AI_WORKER_URL}/process`,
        {
          videoJobId: videoJob._id.toString(),
          bucketName: videoJob.bucketName,
          objectName: videoJob.objectName,
        }
      )

      if (data.status === 'failed') {
        throw new Error(data.message || data.error || 'AI worker failed')
      }

      const incidents = Array.isArray(data.incidents) ? data.incidents : []

      await Incident.deleteMany({
        job: videoJob._id,
      })

      if (incidents.length > 0) {
        await Incident.insertMany(
          incidents.map((incident) => ({
            job: videoJob._id,
            source: videoJob.source || undefined,

            frameObjectName: incident.frameObjectName,
            frameBucketName:
              incident.frameBucketName || process.env.MINIO_BUCKET_FRAMES,
            frameName: incident.frameName,

            timestampSeconds: incident.timestampSeconds || 0,
            timestampLabel: incident.timestampLabel || '00:00:00',

            category: incident.category || 'other',
            detectionSource: incident.detectionSource || 'object',

            severity: incident.severity || 'medium',
            confidence: incident.confidence || 0,

            matchedTerms: incident.matchedTerms || [],
            detections: incident.detections || [],

            transcriptText: incident.transcriptText,
            ocrText: incident.ocrText,

            explanation:
              incident.explanation ||
              'Flagged because a security threat indicator was detected.',

            recommendedAction:
              incident.recommendedAction ||
              'Review this evidence and verify the threat indicator.',
          }))
        )
      }

      videoJob.totalFrames = data.totalFrames || 0
      videoJob.processedFrames = data.processedFrames || 0
      videoJob.flaggedFrames = incidents.length || data.flaggedFrames || 0

      videoJob.status = 'completed'
      videoJob.progress = 100
      videoJob.completedAt = new Date()

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