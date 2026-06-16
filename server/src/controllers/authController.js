const User = require('../models/User')
const generateToken = require('../utils/generateToken')

const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Name, email, and password are required',
      })
    }

    const existingUser = await User.findOne({ email })

    if (existingUser) {
      return res.status(400).json({
        message: 'User already exists',
      })
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'analyst',
    })

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token: generateToken(user._id),
    })
  } catch (error) {
    res.status(500).json({
      message: 'Registration failed',
      error: error.message,
    })
  }
}

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required',
      })
    }

    const user = await User.findOne({ email }).select('+password')

    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password',
      })
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: 'User account is disabled',
      })
    }

    const isMatch = await user.comparePassword(password)

    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid email or password',
      })
    }

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token: generateToken(user._id),
    })
  } catch (error) {
    res.status(500).json({
      message: 'Login failed',
      error: error.message,
    })
  }
}

const getMe = async (req, res) => {
  res.json({
    user: req.user,
  })
}

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: 'Current password and new password are required',
      })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: 'New password must be at least 6 characters long',
      })
    }

    const user = await User.findById(req.user.id).select('+password')

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      })
    }

    const isMatch = await user.comparePassword(currentPassword)

    if (!isMatch) {
      return res.status(401).json({
        message: 'Current password is incorrect',
      })
    }

    user.password = newPassword
    await user.save()

    res.json({
      message: 'Password changed successfully',
    })
  } catch (error) {
    res.status(500).json({
      message: 'Failed to change password',
      error: error.message,
    })
  }
}

module.exports = {
  registerUser,
  loginUser,
  getMe,
  changePassword,
}