const jwt = require('jsonwebtoken')
const User = require('../models/User')

const protect = async (req, res, next) => {
  try {
    let token

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1]
    }

    if (!token) {
      return res.status(401).json({
        message: 'Not authorized, token missing',
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const user = await User.findById(decoded.id).select('-password')

    if (!user || !user.isActive) {
      return res.status(401).json({
        message: 'Not authorized, user not found or disabled',
      })
    }

    req.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    }

    next()
  } catch (error) {
    res.status(401).json({
      message: 'Not authorized, token failed',
      error: error.message,
    })
  }
}

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'Access denied for this role',
      })
    }

    next()
  }
}

module.exports = {
  protect,
  authorizeRoles,
}