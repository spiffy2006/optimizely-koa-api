const getClient = require('../libs/optimizely')
const Router = require('@koa/router')
const { SDK_KEY_HEADER } = require('../constants')

// makes all requests in this router instance start at /featureFlags
const router = new Router({
  prefix: '/dataFiles'
})

// post to update and cache the latest version of the datafile
router.post('/', async function (ctx) {
  const optimizely = getClient(ctx.request.headers[SDK_KEY_HEADER])
  const dataFile = await optimizely.cacheDataFile()
  if (!dataFile) {
    ctx.state.response.addError('Unable to update datafile')
    ctx.state.response.status = 400
  } else {
    ctx.state.response.body = { dataFile: dataFile }
    ctx.state.response.status = 201
  }
})

// get the currently cached datafile
router.get('/', async function (ctx) {
  const optimizely = getClient(ctx.request.headers[SDK_KEY_HEADER])
  const file = await optimizely.getDataFile()
  if (!file) {
    ctx.state.response.addError('Unable to retrieve data file')
    ctx.state.response.status = 400
  } else {
    ctx.state.response.body = { dataFile: file }
    ctx.state.response.status = 200
  }
})

module.exports = router
