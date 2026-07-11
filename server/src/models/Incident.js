const mongoose = require('mongoose')

const detectionSchema = new mongoose.Schema(
  {
    label: {
      type: String,
    },

    confidence: {
      type: Number,
      min: 0,
      max: 1,
    },

    bbox: {
      type: [Number],
      default: [],
    },
  },
  {
    _id: false,
  }
)

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
    },

    frameBucketName: {
      type: String,
    },

    frameName: {
      type: String,
    },

    timestampSeconds: {
      type: Number,
      required: true,
    },

    timestampLabel: {
      type: String,
    },

    category: {
      type: String,
      enum: [
        'threat_text',
        'threat_audio',
        'harmful_object',
        'restricted_zone_violation',
        'suspicious_activity',
        'multiple',
        'other',
      ],
      required: true,
    },

    detectionSource: {
      type: String,
      enum: ['text', 'audio', 'object', 'zone', 'multi', 'manual'],
      required: true,
    },

    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },

    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0,
    },

    matchedTerms: {
      type: [String],
      default: [],
    },

    detections: {
      type: [detectionSchema],
      default: [],
    },

    transcriptText: {
      type: String,
    },

    ocrText: {
      type: String,
    },

    explanation: {
      type: String,
      required: true,
    },

    recommendedAction: {
      type: String,
      default: 'Review this evidence and verify the threat indicator.',
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

incidentSchema.index({ job: 1, timestampSeconds: 1 })
incidentSchema.index({ category: 1, detectionSource: 1 })
incidentSchema.index({ reviewStatus: 1 })

module.exports = mongoose.model('Incident', incidentSchema)