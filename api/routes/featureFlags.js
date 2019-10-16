const Router = require('@koa/router')
const getClient = require('../libs/optimizely')
const { SDK_KEY_HEADER } = require('../constants')

// makes all requests in this router instance start at /featureFlags
const router = new Router({
  prefix: '/featureFlags'
})

// get all feature flags matching the sdk key
router.get('/', async function (ctx) {
  const optimizely = getClient(ctx.request.headers[SDK_KEY_HEADER])
  const featureFlags = await optimizely.getFeatureFlagsList()
  ctx.state.response.body = { featureFlags }
})

// get a map of enabled and disabled features for a user
router.get('/:user_id', async function (ctx) {
  const optimizely = getClient(ctx.request.headers[SDK_KEY_HEADER])
  const enabled = await optimizely.getFeatureFlagsEnabled(
    ctx.params.user_id,
    ctx.query
  )
  ctx.state.response.body = { enabled }
})

// get whether a specific feature is enabled
router.get('/:user_id/:feature', async function (ctx) {
  const optimizely = getClient(ctx.request.headers[SDK_KEY_HEADER])
  const enabled = await optimizely.isFeatureEnabled(
    ctx.params.feature,
    ctx.params.user_id,
    ctx.query
  )

  ctx.state.response.body = { enabled }
})

module.exports = router
