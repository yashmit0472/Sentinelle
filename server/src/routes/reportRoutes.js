const express = require('express')

const {
  getReports,
  getReportByJobId,
} = require('../controllers/reportController')

const {
  protect,
} = require('../middleware/authMiddleware')

const router = express.Router()

router.use(protect)

router.get('/', getReports)

router.get('/:jobId', getReportByJobId)

module.exports = router