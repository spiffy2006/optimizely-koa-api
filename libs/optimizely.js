const optimizelySDK = require('@optimizely/optimizely-sdk');
const NodeCache = require('node-cache')
const fetch = require('node-fetch')
const cache = new NodeCache()
const cdnUrl = 'https://cdn.optimizely.com'

optimizelySDK.setLogLevel('info');
optimizelySDK.setLogger(optimizelySDK.logging.createLogger())
let instances = {}

class Optimizely {
  constructor (sdkKey) {
    this.sdkKey = sdkKey
    this.client = optimizelySDK.createInstance({
      sdkKey: sdkKey,
      datafileOptions: {
        autoUpdate: true,
        updateInterval: 1000,  // 1 second in milliseconds
      },
    });
  }

  isFeatureEnabled (feature, userId) {
    return this.client.isFeatureEnabled(feature, userId)
  }

  async cacheDataFile () {
    const response = await fetch(`${cdnUrl}/datafiles/${this.sdkKeyy}.json`)
    const dataFile = await response.text()
    if (!dataFile) {
      return null
    }
    cache.set(this.sdkKey, dataFile)
    return dataFile
  }

  getDataFile () {
    const dataFile = cache.get(this.sdkKey)
    if (dataFile === undefined) {
      return null
    }
    return dataFile
  }
}


module.exports = function(sdkKey) {
  if (instances[sdkKey]) {
    return instances[sdkKey]
  } else {
    return new Optimizely(sdkKey)
  }
}
