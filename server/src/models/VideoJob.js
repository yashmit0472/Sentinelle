const mongoose = require('mongoose')

const videoJobSchema = new mongoose.Schema(
  {
    source: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VideoSource',
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    originalFileName: {
      type: String,
      required: true,
    },

    objectName: {
      type: String,
      required: true,
    },

    bucketName: {
      type: String,
      required: true,
    },

    mimeType: {
      type: String,
    },

    size: {
      type: Number,
    },

    status: {
      type: String,
      enum: [
        'uploaded',
        'queued',
        'processing',
        'completed',
        'failed',
        'cancelled',
      ],
      default: 'uploaded',
    },

    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    totalFrames: {
      type: Number,
      default: 0,
    },

    processedFrames: {
      type: Number,
      default: 0,
    },

    flaggedFrames: {
      type: Number,
      default: 0,
    },

    errorMessage: {
      type: String,
    },

    startedAt: {
      type: Date,
    },

    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model('VideoJob', videoJobSchema)