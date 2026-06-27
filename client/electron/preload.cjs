const { contextBridge } = require('electron')

contextBridge.exposeInMainWorld('sentinelle', {
  platform: process.platform,
})