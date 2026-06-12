const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()

const app = express()
app.use(cors())
app.use(express.json())

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'sentinelle-server' })
})

mongoose
    .connect(process.env.MONGO_URI)

    .then(async () => {
        const { ensureBuckets } = require('./services/minio')

        await ensureBuckets()
        console.log('MinIO buckets ready')
        console.log('MongoDB connected')
        app.listen(process.env.PORT, () => {
            console.log(`Server running on port ${process.env.PORT}`)
        })
    })
    .catch((err) => console.error('MongoDB connection error:', err))

