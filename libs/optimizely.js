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
    this.client = null
    this.parsed = null // parsed data file
    this.datafile = null // raw json datafile
  }

  async createClient () {
    const datafile = await this.getDataFile()
    return optimizelySDK.createInstance({
      datafile,
      sdkKey: this.sdkKey,
      datafileOptions: {
        autoUpdate: true,
        updateInterval: 1000,  // 1 second in milliseconds
      }
    })
  }

  async getFeatureFlagsList () {
    const datafile = await this.getParsedDataFile()
    if (datafile.featureFlags && datafile.featureFlags.length > 0) {
      return datafile.featureFlags.map(ff => ff.key)
    }
  }

  async getFeatureFlagsEnabled (userId,  attributes = {}) {
    const featureFlags = await this.getFeatureFlagsList()
    let enabled = {}
    for (var i = 0; i < featureFlags.length; i++) {
      enabled[featureFlags[i]] = await this.isFeatureEnabled(featureFlags[i], userId, attributes)
    }
    return enabled
  }

  async clientReady () {
    new Promise((resolve) => {
      this.client.onReady(() => {
        resolve()
      })
    })
  }

  async getClient () {
    if (this.client !== null) {
      return this.client
    } else {
      this.client = await this.createClient()
      await this.clientReady()
      return this.client
    }
  }

  async getParsedDataFile () {
    if (this.parsed !== null) {
      return this.parsed
    }
    const file = await this.getDataFile()
    let data = null
    try {
      data = JSON.parse(file)
    } catch (e) {
      // I guess it is already parsed?
      data = file
    }
    this.parsed = data
    return this.parsed
  }

  async validateAttributes (attributes) {
    let datafile = await this.getParsedDataFile()
    if (!datafile.attributes || datafile.attributes.length === 0) {
      return {}
    }
    let validated = {}
    datafile.attributes.forEach(attr => {
      if (attributes[attr.key]) {
        validated[attr.key] = attributes[attr.key]
      }
    })
    return validated
  }

  async isFeatureEnabled (feature, userId, attributes = {}) {
    const client = await this.getClient()
    const attrs = await this.validateAttributes(attributes)
    return client.isFeatureEnabled(feature, userId, attrs)
  }

  async cacheDataFile () {
    const response = await fetch(`${cdnUrl}/datafiles/${this.sdkKey}.json`)
    const dataFile = await response.json()
    if (!dataFile) {
      return null
    }
    cache.set(this.sdkKey, dataFile)
    return dataFile
  }

  async getDataFile () {
    if (this.datafile !== null) {
      return this.datafile
    }
    this.datafile = cache.get(this.sdkKey)
    if (this.datafile === undefined) {
      this.datafile = await this.cacheDataFile()
    }
    return this.datafile
  }
}


module.exports = function(sdkKey) {
  if (instances[sdkKey]) {
    return instances[sdkKey]
  } else {
    return new Optimizely(sdkKey)
  }
}
