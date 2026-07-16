const fs = require('fs')
const path = require('path')
const { randomUUID } = require('crypto')

const VideoJob = require('../models/VideoJob')
const VideoSource = require('../models/VideoSource')
const AuditLog = require('../models/AuditLog')
const Incident = require('../models/Incident')
const VideoReport = require('../models/VideoReport')

const {
  uploadFile,
  getSignedUrl,
  listObjects,
  removeObject,
  removeObjects,
  streamObject,
} = require('../services/minio')

const { videoQueue } = require('../queues/videoQueue')

const uploadVideo = async (req, res) => {
  try {
    const { sourceId } = req.body

    if (!req.file) {
      return res.status(400).json({
        message: 'Video file is required',
      })
    }

    let source = null

    if (sourceId) {
      source = await VideoSource.findById(sourceId)

      if (!source || !source.isActive) {
        fs.unlinkSync(req.file.path)

        return res.status(404).json({
          message: 'Video source not found',
        })
      }
    }

    const fileExtension = path.extname(req.file.originalname)

    const objectName = `raw/${new Date()
      .toISOString()
      .slice(0, 10)}/${randomUUID()}${fileExtension}`

    await uploadFile(
      process.env.MINIO_BUCKET_RAW,
      objectName,
      req.file.path,
      req.file.mimetype
    )

    const job = await VideoJob.create({
      source: source ? source._id : undefined,
      uploadedBy: req.user.id,
      originalFileName: req.file.originalname,
      objectName,
      bucketName: process.env.MINIO_BUCKET_RAW,
      mimeType: req.file.mimetype,
      size: req.file.size,
      status: 'uploaded',
      progress: 0,
    })

    const queueJob = await videoQueue.add(
      'process-video',
      {
        videoJobId: job._id.toString(),
      },
      {
        attempts: 3,
        removeOnComplete: true,
        removeOnFail: false,
      }
    )

    job.queueJobId = queueJob.id
    job.status = 'queued'
    await job.save()

    await AuditLog.create({
      user: req.user.id,
      action: 'UPLOAD_VIDEO',
      entityType: 'VideoJob',
      entityId: job._id,
      details: {
        originalFileName: req.file.originalname,
        objectName,
        bucketName: process.env.MINIO_BUCKET_RAW,
        size: req.file.size,
        sourceId: source ? source._id : null,
      },
      ipAddress: req.ip,
    })

    fs.unlinkSync(req.file.path)

    const signedUrl = await getSignedUrl(
      process.env.MINIO_BUCKET_RAW,
      objectName,
      3600
    )

    res.status(201).json({
      message: 'Video uploaded successfully',
      job: {
        id: job._id,
        queueJobId: job.queueJobId,
        source: job.source,
        originalFileName: job.originalFileName,
        objectName: job.objectName,
        bucketName: job.bucketName,
        status: job.status,
        progress: job.progress,
        size: job.size,
        createdAt: job.createdAt,
      },
      previewUrl: signedUrl,
    })
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path)
    }

    res.status(500).json({
      message: 'Video upload failed',
      error: error.message,
    })
  }
}

const getVideoJobs = async (req, res) => {
  try {
    const jobs = await VideoJob.find()
      .populate('uploadedBy', 'name email role')
      .populate('source', 'name type location')
      .sort({ createdAt: -1 })

    res.json({
      count: jobs.length,
      jobs,
    })
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch video jobs',
      error: error.message,
    })
  }
}

const getVideoJobById = async (req, res) => {
  try {
    const job = await VideoJob.findById(req.params.id)
      .populate('uploadedBy', 'name email role')
      .populate('source', 'name type location restrictedZones')

    if (!job) {
      return res.status(404).json({
        message: 'Video job not found',
      })
    }

    const signedUrl = await getSignedUrl(
      job.bucketName,
      job.objectName,
      3600
    )

    res.json({
      job,
      videoUrl: signedUrl,
    })
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch video job',
      error: error.message,
    })
  }
}

const getVideoFrames = async (req, res) => {
  try {
    const job = await VideoJob.findById(req.params.id)

    if (!job) {
      return res.status(404).json({
        message: 'Video job not found',
      })
    }

    const incidents = await Incident.find({
      job: job._id,
    }).sort({
      timestampSeconds: 1,
      createdAt: 1,
    })

    const frames = incidents
      .filter((incident) => incident.frameObjectName)
      .map((incident) => {
        const frameName =
          incident.frameName || path.basename(incident.frameObjectName)

        return {
          incidentId: incident._id,
          name: incident.frameObjectName,
          frameName,
          viewPath: `/videos/jobs/${job._id}/frames/${encodeURIComponent(
            frameName
          )}/view`,

          timestampSeconds: incident.timestampSeconds,
          timestampLabel: incident.timestampLabel,

          category: incident.category,
          detectionSource: incident.detectionSource,
          severity: incident.severity,
          confidence: incident.confidence,

          matchedTerms: incident.matchedTerms,
          detections: incident.detections,

          explanation: incident.explanation,
          recommendedAction: incident.recommendedAction,
          reviewStatus: incident.reviewStatus,
        }
      })

    res.json({
      count: frames.length,
      frames,
    })
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch frames',
      error: error.message,
    })
  }
}

const streamVideoFrame = async (req, res) => {
  try {
    const job = await VideoJob.findById(req.params.id)

    if (!job) {
      return res.status(404).json({
        message: 'Video job not found',
      })
    }

    const frameName = path.basename(req.params.frameName)
    const objectName = `${job._id}/${frameName}`

    const frameStream = await streamObject(
      process.env.MINIO_BUCKET_FRAMES,
      objectName
    )

    res.setHeader('Content-Type', 'image/jpeg')
    res.setHeader('Content-Disposition', `inline; filename="${frameName}"`)

    frameStream.on('error', () => {
      if (!res.headersSent) {
        res.status(404).json({
          message: 'Frame not found',
        })
      }
    })

    frameStream.pipe(res)
  } catch (error) {
    res.status(500).json({
      message: 'Failed to stream frame',
      error: error.message,
    })
  }
}

const deleteVideoJob = async (req, res) => {
  try {
    const job = await VideoJob.findById(req.params.id)

    if (!job) {
      return res.status(404).json({
        message: 'Video job not found',
      })
    }

    if (job.status === 'processing') {
      return res.status(409).json({
        message: 'Cannot delete a job while it is processing',
      })
    }

    const framePrefix = `${job._id}/`
    const frameObjects = await listObjects(
      process.env.MINIO_BUCKET_FRAMES,
      framePrefix
    )

    await Promise.all([
      removeObject(job.bucketName, job.objectName).catch(() => null),
      removeObjects(
        process.env.MINIO_BUCKET_FRAMES,
        frameObjects.map((object) => object.name).filter(Boolean)
      ).catch(() => null),
      Incident.deleteMany({
        job: job._id,
      }),
      VideoReport.deleteOne({
        job: job._id,
      }),
    ])

    await AuditLog.create({
      user: req.user.id,
      action: 'DELETE_VIDEO_JOB',
      entityType: 'VideoJob',
      entityId: job._id,
      details: {
        originalFileName: job.originalFileName,
        objectName: job.objectName,
        bucketName: job.bucketName,
        deletedAt: new Date(),
      },
      ipAddress: req.ip,
    })

    await job.deleteOne()

    res.json({
      message: 'Video job deleted successfully',
      id: req.params.id,
    })
  } catch (error) {
    res.status(500).json({
      message: 'Failed to delete video job',
      error: error.message,
    })
  }
}

module.exports = {
  uploadVideo,
  getVideoJobs,
  getVideoJobById,
  getVideoFrames,
  streamVideoFrame,
  deleteVideoJob,
}
