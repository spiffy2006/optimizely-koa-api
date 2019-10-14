const getClient = require('../libs/optimizely')
const Router = require('@koa/router');
const router = new Router({
  prefix: '/dataFiles'
});

router.post("/:sdk_key", async function (ctx) {
  // grab data file from optimizely and cache it
  const optimizely = getClient(ctx.params.sdk_key)
  const dataFile = await optimizely.cacheDataFile()
  if (!dataFile) {
    ctx.body = {errors: 'Invalid SDK Key provided'}
    ctx.status = 400
    return
  }
  ctx.body = {data: {dataFile: dataFile}}
  ctx.status = 201
});

router.get("/:sdk_key", async function (ctx) {
  const optimizely = getClient(ctx.params.sdk_key)
  const file = optimizely.getDataFile()
  if (!file) {
    ctx.body = {errors: 'Unable to retrieve data file'}
    ctx.status = 400
    return
  }
  ctx.body = {dataFile: file}
  ctx.status = 200
});

module.exports = router