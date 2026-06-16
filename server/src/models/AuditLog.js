const mongoose = require('mongoose')

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    action: {
      type: String,
      required: true,
      trim: true,
    },

    entityType: {
      type: String,
      trim: true,
    },

    entityId: {
      type: mongoose.Schema.Types.ObjectId,
    },

    details: {
      type: mongoose.Schema.Types.Mixed,
    },

    ipAddress: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model('AuditLog', auditLogSchema)