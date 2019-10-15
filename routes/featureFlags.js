const Router = require('@koa/router')
const getClient = require('../libs/optimizely')
const router = new Router({
  prefix: '/featureFlags'
});

router.get("/", async function (ctx) {
  ctx.body = 'This works?'
});

router.get("/:sdk_key/:feature/:user_id", async function (ctx) {
  const optimizely = getClient(ctx.params.sdk_key)
  const enabled = await optimizely.isFeatureEnabled(
    ctx.params.feature,
    ctx.params.user_id,
    ctx.query
  )

  ctx.body = { data: { enabled } }
  // ctx.params.sdk_key
});

module.exports = router