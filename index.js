const Koa = require('koa')
const Router = require('@koa/router')
const bodyParser = require('koa-bodyparser')
const logger = require('koa-logger')
const cors = require('@koa/cors')
const { SDK_KEY_HEADER } = require('./constants')
const featureFlags = require('./routes/featureFlags')
const dataFiles = require('./routes/dataFiles')
const response = require('./json-api/response')
const jsonapi = require('./json-api')

const app = new Koa()
const router = new Router()
app.use(bodyParser())
app.use(cors())
app.use(logger())
app.use(jsonapi())

/**
 * Check that the optimizely sdk key header is present.
 * If it isn't throw a 400 error and let the user know
 */
app.use(async (ctx, next) => {
  if (!ctx.request.headers[SDK_KEY_HEADER]) {
    ctx.status = 400
    response.addError('request missing sdk key')
    response.getResponse()
    return
  }
  await next()
})

/**
 * Give a generic message for a request to /
 */
router.get('/', async function (ctx) {
  response.status = 200
  response.body = {
    message:
      'Welcome to the optimizely feature flag api microservice. Create a full stack account and some feature flags to start using me.'
  }
})

/**
 * Use feature flag and data file routes
 */
app.use(featureFlags.routes()).use(featureFlags.allowedMethods())
app.use(dataFiles.routes()).use(dataFiles.allowedMethods())
app.listen(3001)
