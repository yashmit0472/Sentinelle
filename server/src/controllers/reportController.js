const VideoReport = require('../models/VideoReport')

const getReports = async (req, res) => {
  try {
    const reports = await VideoReport.find()
      .populate({
        path: 'job',
        select:
          'originalFileName uploadedBy createdAt completedAt status',
        populate: {
          path: 'uploadedBy',
          select: 'name email',
        },
      })
      .sort({ createdAt: -1 })

    res.json({
      count: reports.length,
      reports,
    })
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch reports',
      error: error.message,
    })
  }
}

const getReportByJobId = async (req, res) => {
  try {
    const report = await VideoReport.findOne({
      job: req.params.jobId,
    }).populate({
      path: 'job',
      populate: {
        path: 'uploadedBy',
        select: 'name email',
      },
    })

    if (!report) {
      return res.status(404).json({
        message: 'Report not found',
      })
    }

    res.json(report)
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch report',
      error: error.message,
    })
  }
}

module.exports = {
  getReports,
  getReportByJobId,
}