const getClient = require('../libs/optimizely')
const Router = require('@koa/router')
const { SDK_KEY_HEADER } = require('../constants')
const response = require('../json-api/response')

// makes all requests in this router instance start at /featureFlags
const router = new Router({
  prefix: '/dataFiles'
})

// post to update and cache the latest version of the datafile
router.post('/', async function (ctx) {
  const optimizely = getClient(ctx.request.headers[SDK_KEY_HEADER])
  const dataFile = await optimizely.cacheDataFile()
  if (!dataFile) {
    response.addError('Unable to update datafile')
    response.status = 400
  } else {
    response.body = { dataFile: dataFile }
    response.status = 201
  }
})

// get the currently cached datafile
router.get('/', async function (ctx) {
  const optimizely = getClient(ctx.request.headers[SDK_KEY_HEADER])
  const file = await optimizely.getDataFile()
  if (!file) {
    response.addError('Unable to retrieve data file')
    response.status = 400
  } else {
    response.body = { dataFile: file }
    response.status = 200
  }
})

module.exports = router
