const express = require('express')

const {
  getIncidents,
  getIncidentById,
  getIncidentFrame,
  updateIncidentStatus,
  addIncidentNote,
} = require('../controllers/incidentController')

const {
  protect,
  authorizeRoles,
} = require('../middleware/authMiddleware')

const router = express.Router()

router.use(protect)

router.get('/', getIncidents)

router.get('/:id', getIncidentById)

router.get('/:id/frame', getIncidentFrame)

router.patch(
  '/:id/status',
  authorizeRoles('admin', 'analyst'),
  updateIncidentStatus
)

router.patch(
  '/:id/note',
  authorizeRoles('admin', 'analyst'),
  addIncidentNote
)

module.exports = router
