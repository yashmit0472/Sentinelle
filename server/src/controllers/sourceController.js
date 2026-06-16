const VideoSource = require('../models/VideoSource')
const AuditLog = require('../models/AuditLog')

const createSource = async (req, res) => {
  try {
    const {
      name,
      type,
      location,
      description,
      streamUrl,
      restrictedZones,
    } = req.body

    if (!name) {
      return res.status(400).json({
        message: 'Source name is required',
      })
    }

    if ((type === 'rtmp' || type === 'hls') && !streamUrl) {
      return res.status(400).json({
        message: 'Stream URL is required for RTMP/HLS sources',
      })
    }

    const source = await VideoSource.create({
      name,
      type: type || 'upload',
      location,
      description,
      streamUrl,
      restrictedZones: restrictedZones || [],
      createdBy: req.user.id,
    })

    await AuditLog.create({
      user: req.user.id,
      action: 'CREATE_VIDEO_SOURCE',
      entityType: 'VideoSource',
      entityId: source._id,
      details: {
        name: source.name,
        type: source.type,
      },
      ipAddress: req.ip,
    })

    res.status(201).json({
      message: 'Video source created successfully',
      source,
    })
  } catch (error) {
    res.status(500).json({
      message: 'Failed to create video source',
      error: error.message,
    })
  }
}

const getSources = async (req, res) => {
  try {
    const sources = await VideoSource.find({ isActive: true })
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 })

    res.json({
      count: sources.length,
      sources,
    })
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch video sources',
      error: error.message,
    })
  }
}

const getSourceById = async (req, res) => {
  try {
    const source = await VideoSource.findById(req.params.id).populate(
      'createdBy',
      'name email role'
    )

    if (!source || !source.isActive) {
      return res.status(404).json({
        message: 'Video source not found',
      })
    }

    res.json({
      source,
    })
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch video source',
      error: error.message,
    })
  }
}

const updateSource = async (req, res) => {
  try {
    const source = await VideoSource.findById(req.params.id)

    if (!source || !source.isActive) {
      return res.status(404).json({
        message: 'Video source not found',
      })
    }

    const allowedFields = [
      'name',
      'type',
      'location',
      'description',
      'streamUrl',
      'restrictedZones',
      'isActive',
    ]

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        source[field] = req.body[field]
      }
    })

    if ((source.type === 'rtmp' || source.type === 'hls') && !source.streamUrl) {
      return res.status(400).json({
        message: 'Stream URL is required for RTMP/HLS sources',
      })
    }

    await source.save()

    await AuditLog.create({
      user: req.user.id,
      action: 'UPDATE_VIDEO_SOURCE',
      entityType: 'VideoSource',
      entityId: source._id,
      details: {
        updatedFields: req.body,
      },
      ipAddress: req.ip,
    })

    res.json({
      message: 'Video source updated successfully',
      source,
    })
  } catch (error) {
    res.status(500).json({
      message: 'Failed to update video source',
      error: error.message,
    })
  }
}

const deactivateSource = async (req, res) => {
  try {
    const source = await VideoSource.findById(req.params.id)

    if (!source || !source.isActive) {
      return res.status(404).json({
        message: 'Video source not found',
      })
    }

    source.isActive = false
    await source.save()

    await AuditLog.create({
      user: req.user.id,
      action: 'DEACTIVATE_VIDEO_SOURCE',
      entityType: 'VideoSource',
      entityId: source._id,
      details: {
        name: source.name,
        type: source.type,
      },
      ipAddress: req.ip,
    })

    res.json({
      message: 'Video source deactivated successfully',
    })
  } catch (error) {
    res.status(500).json({
      message: 'Failed to deactivate video source',
      error: error.message,
    })
  }
}

module.exports = {
  createSource,
  getSources,
  getSourceById,
  updateSource,
  deactivateSource,
}