const Router = require('@koa/router')
const getClient = require('../libs/optimizely')
const { SDK_KEY_HEADER } = require('../constants')
const router = new Router({
  prefix: '/featureFlags'
});

router.get("/", async function (ctx) {
  const optimizely = getClient(ctx.request.headers[SDK_KEY_HEADER])
  const featureFlags = await optimizely.getFeatureFlagsList()
  ctx.body = { data: { featureFlags } }
});

router.get("/:user_id", async function (ctx) {
  const optimizely = getClient(ctx.request.headers[SDK_KEY_HEADER])
  const enabled = await optimizely.getFeatureFlagsEnabled(
    ctx.params.user_id,
    ctx.query
  )

  ctx.body = { data: { enabled } }
});

router.get("/:user_id", async function (ctx  ) {
  const optimizely = getClient(ctx.request.headers[SDK_KEY_HEADER])
  const enabled = await optimizely.isFeatureEnabled(
    ctx.params.feature,
    ctx.params.user_id,
    ctx.query
  )

  ctx.body = { data: { enabled } }
});

module.exports = router