const express = require('express')

const {
  registerUser,
  loginUser,
  getMe,
} = require('../controllers/authController')

const {
  protect,
  authorizeRoles,
} = require('../middleware/authMiddleware')

const router = express.Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/me', protect, getMe)

// test route for admin-only access
router.get('/admin-only', protect, authorizeRoles('admin'), (req, res) => {
  res.json({
    message: 'Admin access granted',
  })
})

module.exports = router