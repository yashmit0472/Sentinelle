const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const Redis = require('ioredis')
require('dotenv').config()

const { ensureBuckets } = require('./services/minio')
const authRoutes = require('./routes/authRoutes')
const sourceRoutes = require('./routes/sourceRoutes')
const videoRoutes = require('./routes/videoRoutes')
const { startVideoWorker } = require('./workers/videoWorker')
const incidentRoutes = require('./routes/incidentRoutes')
const reportRoutes = require('./routes/reportRoutes')

const app = express()
const redis = new Redis(process.env.REDIS_URL)

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/sources', sourceRoutes)
app.use('/api/videos', videoRoutes)
app.use('/api/incidents', incidentRoutes)
app.use('/api/reports', reportRoutes)

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'sentinelle-server',
  })
})

app.get('/api/ready', async (req, res) => {
  try {
    const mongoReady = mongoose.connection.readyState === 1
    const redisPing = await redis.ping()

    res.json({
      status: 'ready',
      mongo: mongoReady ? 'connected' : 'not_connected',
      redis: redisPing,
      service: 'sentinelle-server',
    })
  } catch (error) {
    res.status(500).json({
      status: 'not_ready',
      error: error.message,
    })
  }
})

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected')

    await ensureBuckets()
    console.log('MinIO buckets ready')

    startVideoWorker()

    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`)
    })
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err)
    process.exit(1)
  })