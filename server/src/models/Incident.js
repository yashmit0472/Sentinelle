const mongoose = require('mongoose')

const incidentSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VideoJob',
      required: true,
    },

    source: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VideoSource',
    },

    frameObjectName: {
      type: String,
      required: true,
    },

    frameBucketName: {
      type: String,
      required: true,
    },

    timestampSeconds: {
      type: Number,
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'low',
    },

    confidence: {
      type: Number,
      min: 0,
      max: 1,
    },

    explanation: {
      type: String,
    },

    recommendedAction: {
      type: String,
    },

    reviewStatus: {
      type: String,
      enum: ['new', 'under_review', 'confirmed', 'dismissed', 'escalated'],
      default: 'new',
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    reviewNote: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model('Incident', incidentSchema)