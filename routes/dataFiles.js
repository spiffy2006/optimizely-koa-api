const getClient = require('../libs/optimizely')
const Router = require('@koa/router')
const { SDK_KEY_HEADER } = require('../constants')

// makes all requests in this router instance start at /featureFlags
const router = new Router({
  prefix: '/dataFiles'
})

// post to update and cache the latest version of the datafile
router.post("/", async function (ctx) {
  const optimizely = getClient(ctx.request.headers[SDK_KEY_HEADER])
  const dataFile = await optimizely.cacheDataFile()
  if (!dataFile) {
    ctx.body = {errors: 'Invalid SDK Key provided'}
    ctx.status = 400
    return
  }
  ctx.body = {data: {dataFile: dataFile}}
  ctx.status = 201
})

// get the currently cached datafile
router.get("/", async function (ctx) {
  const optimizely = getClient(ctx.request.headers[SDK_KEY_HEADER])
  const file = await optimizely.getDataFile()
  if (!file) {
    ctx.body = {errors: 'Unable to retrieve data file'}
    ctx.status = 400
    return
  }
  ctx.body = {dataFile: file}
  ctx.status = 200
});

module.exports = router