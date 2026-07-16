const path = require('path')
const mongoose = require('mongoose')

const Incident = require('../models/Incident')
const VideoJob = require('../models/VideoJob')
const {
  getSignedUrl,
  streamObject,
} = require('../services/minio')

const VALID_REVIEW_STATUSES = [
  'new',
  'under_review',
  'confirmed',
  'dismissed',
  'escalated',
  'closed',
]

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const buildSearchFilter = (search) => {
  if (!search?.trim()) {
    return null
  }

  const pattern = new RegExp(escapeRegex(search.trim()), 'i')

  return {
    $or: [
      { explanation: pattern },
      { ocrText: pattern },
      { transcriptText: pattern },
      { matchedTerms: pattern },
      { category: pattern },
      { detectionSource: pattern },
      { recommendedAction: pattern },
    ],
  }
}

const buildIncidentDetail = async (incident) => {
  const detail = incident.toObject({
    virtuals: true,
  })

  const frameName =
    detail.frameName ||
    (detail.frameObjectName
      ? path.basename(detail.frameObjectName)
      : null)

  const frameViewPath = detail._id
    ? `/incidents/${detail._id}/frame`
    : null

  let videoUrl = null
  let frameUrl = null

  if (detail.job?.bucketName && detail.job?.objectName) {
    videoUrl = await getSignedUrl(
      detail.job.bucketName,
      detail.job.objectName,
      3600
    )
  }

  if (detail.frameBucketName && detail.frameObjectName) {
    frameUrl = await getSignedUrl(
      detail.frameBucketName,
      detail.frameObjectName,
      3600
    )
  }

  return {
    ...detail,
    video: detail.job
      ? {
          id: detail.job._id,
          originalFileName: detail.job.originalFileName,
          status: detail.job.status,
          objectName: detail.job.objectName,
          bucketName: detail.job.bucketName,
          source: detail.source,
          uploadedBy: detail.job.uploadedBy,
          createdAt: detail.job.createdAt,
          completedAt: detail.job.completedAt,
          videoUrl,
        }
      : null,
    evidence: {
      frameName,
      frameObjectName: detail.frameObjectName || null,
      frameBucketName: detail.frameBucketName || null,
      frameViewPath,
      frameUrl,
      boundingBoxes: Array.isArray(detail.detections)
        ? detail.detections
            .filter((detection) => Array.isArray(detection.bbox) && detection.bbox.length > 0)
            .map((detection) => ({
              label: detection.label,
              confidence: detection.confidence,
              bbox: detection.bbox,
            }))
        : [],
    },
  }
}

const getIncidents = async (req, res) => {
  try {
    const { search, severity, status, source, latestOnly } = req.query
    const filter = {}
    let latestJob = null

    const shouldUseLatestOnly = latestOnly !== 'false'

    if (shouldUseLatestOnly) {
      latestJob = await VideoJob.findOne()
        .sort({ createdAt: -1 })
        .select('_id originalFileName createdAt')

      if (!latestJob) {
        return res.json({
          count: 0,
          filters: {
            search: search || '',
            severity: severity || '',
            status: status || '',
            source: source || '',
            latestOnly: shouldUseLatestOnly,
          },
          scope: null,
          incidents: [],
        })
      }

      filter.job = latestJob._id
    }

    if (severity) {
      filter.severity = severity
    }

    if (status) {
      filter.reviewStatus = status
    }

    if (source) {
      filter.detectionSource = source
    }

    const searchFilter = buildSearchFilter(search)

    if (searchFilter) {
      Object.assign(filter, searchFilter)
    }

    const incidents = await Incident.find(filter)
      .populate('job', 'originalFileName status bucketName objectName createdAt completedAt')
      .populate('source', 'name type location')
      .populate('reviewedBy', 'name email role')
      .populate('assignedTo', 'name email role')
      .sort({
        timestampSeconds: -1,
        createdAt: -1,
      })

    const incidentPayload = await Promise.all(
      incidents.map(async (incident) => {
        const incidentData = incident.toObject()
        let frameUrl = null

        if (incidentData.frameBucketName && incidentData.frameObjectName) {
          frameUrl = await getSignedUrl(
            incidentData.frameBucketName,
            incidentData.frameObjectName,
            3600
          )
        }

        return {
          ...incidentData,
          frameViewPath: `/incidents/${incidentData._id}/frame`,
          frameUrl,
        }
      })
    )

    res.json({
      count: incidents.length,
      filters: {
        search: search || '',
        severity: severity || '',
        status: status || '',
        source: source || '',
        latestOnly: shouldUseLatestOnly,
      },
      scope: shouldUseLatestOnly
        ? {
            mode: 'latest_job',
            jobId: latestJob ? String(latestJob._id) : null,
            videoName: latestJob?.originalFileName || null,
            uploadedAt: latestJob?.createdAt || null,
          }
        : {
            mode: 'all_jobs',
          },
      incidents: incidentPayload,
    })
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch incidents',
      error: error.message,
    })
  }
}

const getIncidentById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: 'Invalid incident id',
      })
    }

    const incident = await Incident.findById(req.params.id)
      .populate('job', 'originalFileName status bucketName objectName uploadedBy createdAt completedAt')
      .populate('source', 'name type location description')
      .populate('reviewedBy', 'name email role')
      .populate('assignedTo', 'name email role')
      .populate('reviewHistory.user', 'name email role')
      .populate('analystNotes.user', 'name email role')

    if (!incident) {
      return res.status(404).json({
        message: 'Incident not found',
      })
    }

    const incidentDetail = await buildIncidentDetail(incident)

    res.json(incidentDetail)
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch incident',
      error: error.message,
    })
  }
}

const getIncidentFrame = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: 'Invalid incident id',
      })
    }

    const incident = await Incident.findById(req.params.id).select(
      'frameBucketName frameObjectName frameName'
    )

    if (!incident) {
      return res.status(404).json({
        message: 'Incident not found',
      })
    }

    if (!incident.frameBucketName || !incident.frameObjectName) {
      return res.status(404).json({
        message: 'Frame not available for this incident',
      })
    }

    const frameStream = await streamObject(
      incident.frameBucketName,
      incident.frameObjectName
    )

    const frameName =
      incident.frameName || path.basename(incident.frameObjectName)

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
      message: 'Failed to stream incident frame',
      error: error.message,
    })
  }
}

const updateIncidentStatus = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: 'Invalid incident id',
      })
    }

    const { status, note } = req.body

    if (!VALID_REVIEW_STATUSES.includes(status)) {
      return res.status(400).json({
        message: 'Invalid review status',
      })
    }

    const trimmedNote = typeof note === 'string' ? note.trim() : ''

    const incident = await Incident.findById(req.params.id)

    if (!incident) {
      return res.status(404).json({
        message: 'Incident not found',
      })
    }

    incident.reviewStatus = status
    incident.reviewedBy = req.user.id
    incident.reviewedAt = new Date()
    incident.reviewNote = trimmedNote

    incident.reviewHistory.push({
      status,
      user: req.user.id,
      note: trimmedNote,
      changedAt: new Date(),
    })

    await incident.save()

    const updatedIncident = await Incident.findById(incident._id)
      .populate('job', 'originalFileName status bucketName objectName uploadedBy createdAt completedAt')
      .populate('source', 'name type location description')
      .populate('reviewedBy', 'name email role')
      .populate('assignedTo', 'name email role')
      .populate('reviewHistory.user', 'name email role')
      .populate('analystNotes.user', 'name email role')

    const incidentDetail = await buildIncidentDetail(updatedIncident)

    res.json({
      message: 'Incident status updated successfully',
      incident: incidentDetail,
    })
  } catch (error) {
    res.status(500).json({
      message: 'Failed to update incident status',
      error: error.message,
    })
  }
}

const addIncidentNote = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: 'Invalid incident id',
      })
    }

    const note = typeof req.body.note === 'string' ? req.body.note.trim() : ''

    if (!note) {
      return res.status(400).json({
        message: 'Analyst note is required',
      })
    }

    const incident = await Incident.findById(req.params.id)

    if (!incident) {
      return res.status(404).json({
        message: 'Incident not found',
      })
    }

    incident.analystNotes.push({
      note,
      user: req.user.id,
      createdAt: new Date(),
    })

    await incident.save()

    const updatedIncident = await Incident.findById(incident._id)
      .populate('job', 'originalFileName status bucketName objectName uploadedBy createdAt completedAt')
      .populate('source', 'name type location description')
      .populate('reviewedBy', 'name email role')
      .populate('assignedTo', 'name email role')
      .populate('reviewHistory.user', 'name email role')
      .populate('analystNotes.user', 'name email role')

    const incidentDetail = await buildIncidentDetail(updatedIncident)

    res.json({
      message: 'Incident note added successfully',
      incident: incidentDetail,
    })
  } catch (error) {
    res.status(500).json({
      message: 'Failed to update incident note',
      error: error.message,
    })
  }
}

module.exports = {
  getIncidents,
  getIncidentById,
  getIncidentFrame,
  updateIncidentStatus,
  addIncidentNote,
}
