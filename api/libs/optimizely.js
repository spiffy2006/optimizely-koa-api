const optimizelySDK = require('@optimizely/optimizely-sdk')
const NodeCache = require('node-cache')
const fetch = require('node-fetch')

const cache = new NodeCache()
const cdnUrl = 'https://cdn.optimizely.com'

optimizelySDK.setLogLevel('info')
optimizelySDK.setLogger(optimizelySDK.logging.createLogger())

// keep the instances being used in memory so we aren't reinstantiating them
const instances = {}

/**
 * Optimizely class for doing all the logic things
 */
class Optimizely {
  constructor (sdkKey) {
    this.sdkKey = sdkKey
    this.client = null
    this.parsed = null // parsed data file
    this.datafile = null // raw json datafile
  }

  /**
   * creates an instance of the optimizely-sdk
   *
   * @return {OptimizelySDK}
   */
  async createClient () {
    const datafile = await this.getDataFile()
    return optimizelySDK.createInstance({
      datafile,
      sdkKey: this.sdkKey,
      datafileOptions: {
        autoUpdate: true,
        updateInterval: 1000 // 1 second in milliseconds
      }
    })
  }

  /**
   * Gets all of the feature flags in the datafile
   *
   * @return {Array}
   */
  async getFeatureFlagsList () {
    const datafile = await this.getParsedDataFile()
    if (datafile.featureFlags && datafile.featureFlags.length > 0) {
      return datafile.featureFlags.map(ff => ff.key)
    }
  }

  /**
   * Gets a map of all enabled and disabled features for a user
   * @param {string} userId
   * @param {Object} attributes
   *
   * @return {Object}
   */
  async getFeatureFlagsEnabled (userId, attributes = {}) {
    const featureFlags = await this.getFeatureFlagsList()
    const enabled = {}
    for (var i = 0; i < featureFlags.length; i++) {
      enabled[featureFlags[i]] = await this.isFeatureEnabled(
        featureFlags[i],
        userId,
        attributes
      )
    }
    return enabled
  }

  /**
   * A wrapper for getting the client to make sure there is always an instance
   *
   * @return {OptimizelySDK}
   */
  async getClient () {
    if (this.client !== null) {
      return this.client
    } else {
      this.client = await this.createClient()
      return this.client
    }
  }

  /**
   * Parsed the json datafile into an actual object
   *
   * @return {Object}
   */
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

  /**
   * Validates the attributes given against the attributes defined in the datafile
   *  and returns only attributes that are defined in the datafile
   * @param {Object} attributes
   *
   * @return {Object}
   */
  async validateAttributes (attributes) {
    const datafile = await this.getParsedDataFile()
    if (!datafile.attributes || datafile.attributes.length === 0) {
      return {}
    }
    const validated = {}
    datafile.attributes.forEach(attr => {
      if (attributes[attr.key]) {
        validated[attr.key] = attributes[attr.key]
      }
    })
    return validated
  }

  /**
   * Returns whether a feature is enabled
   * @param {String} feature
   * @param {String} userId
   * @param {Object} attributes
   *
   * @return {boolean}
   */
  async isFeatureEnabled (feature, userId, attributes = {}) {
    const client = await this.getClient()
    const attrs = await this.validateAttributes(attributes)
    return client.isFeatureEnabled(feature, userId, attrs)
  }

  /**
   * Caches the current datafile on the optimizely cdn
   *
   * @return {String}
   */
  async cacheDataFile () {
    const response = await fetch(`${cdnUrl}/datafiles/${this.sdkKey}.json`)
    const dataFile = await response.json()
    if (!dataFile) {
      return null
    }
    cache.set(this.sdkKey, dataFile)
    return dataFile
  }

  /**
   * Gets the cached datafile
   *
   * @return {String}
   */
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

module.exports = function (sdkKey) {
  if (instances[sdkKey]) {
    return instances[sdkKey]
  } else {
    return new Optimizely(sdkKey)
  }
}
