const { Queue } = require('bullmq')
const IORedis = require('ioredis')

const connection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
})

const videoQueue = new Queue('video-processing', {
  connection,
})

module.exports = {
  videoQueue,
}