const express = require('express')

const {
  uploadVideo,
  getVideoJobs,
  getVideoJobById,
  getVideoFrames,
} = require('../controllers/videoController')

const uploadMiddleware = require('../middleware/uploadMiddleware')

const { protect } = require('../middleware/authMiddleware')

const router = express.Router()

router.post('/upload', protect, uploadMiddleware.single('video'), uploadVideo)

router.get('/jobs', protect, getVideoJobs)

router.get('/jobs/:id', protect, getVideoJobById)

router.get('/jobs/:id/frames', protect, getVideoFrames)

module.exports = router