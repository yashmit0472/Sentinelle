const express = require('express')

const {
  createSource,
  getSources,
  getSourceById,
  updateSource,
  deactivateSource,
} = require('../controllers/sourceController')

const {
  protect,
  authorizeRoles,
} = require('../middleware/authMiddleware')

const router = express.Router()

router
  .route('/')
  .post(protect, authorizeRoles('admin'), createSource)
  .get(protect, getSources)

router
  .route('/:id')
  .get(protect, getSourceById)
  .patch(protect, authorizeRoles('admin'), updateSource)
  .delete(protect, authorizeRoles('admin'), deactivateSource)

module.exports = router