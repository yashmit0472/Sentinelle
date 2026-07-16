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

const analystNoteSchema = new mongoose.Schema(
  {
    note: {
      type: String,
      required: true,
      trim: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: true,
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
  enum: [
    'new',
    'under_review',
    'confirmed',
    'dismissed',
    'escalated',
    'closed',
  ],
  default: 'new',
},

reviewedBy: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User',
},

reviewedAt: {
  type: Date,
},

reviewNote: {
  type: String,
  default: '',
},

reviewHistory: [
  {
    status: {
      type: String,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    note: {
      type: String,
    },

    changedAt: {
      type: Date,
      default: Date.now,
    },
  },
],

analystNotes: {
  type: [analystNoteSchema],
  default: [],
},

assignedTo: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User',
},

caseId: {
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
incidentSchema.index({
  explanation: 'text',
  ocrText: 'text',
  transcriptText: 'text',
  matchedTerms: 'text',
})

module.exports = mongoose.model('Incident', incidentSchema)
