const mongoose = require('mongoose')

const timelineSchema = new mongoose.Schema(
  {
    timestamp: {
      type: String,
    },

    timestampSeconds: {
      type: Number,
    },

    source: {
      type: String,
    },

    severity: {
      type: String,
    },

    matchedTerms: {
      type: [String],
      default: [],
    },

    explanation: {
      type: String,
    },
  },
  {
    _id: false,
  }
)

const statisticsSchema = new mongoose.Schema(
  {
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

    objectDetections: {
      type: Map,
      of: Number,
      default: {},
    },

    textDetections: {
      type: Map,
      of: Number,
      default: {},
    },

    audioDetections: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  {
    _id: false,
  }
)

const reportSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VideoJob',
      required: true,
      unique: true,
    },

    executiveSummary: {
      type: String,
      required: true,
    },

    threatScore: {
      type: Number,
      default: 0,
    },

    threatLevel: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'LOW',
    },

    statistics: {
      type: statisticsSchema,
      default: () => ({}),
    },

    timeline: {
      type: [timelineSchema],
      default: [],
    },

    recommendations: {
      type: [String],
      default: [],
    },

    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
)

reportSchema.index({ job: 1 })

module.exports = mongoose.model('VideoReport', reportSchema)