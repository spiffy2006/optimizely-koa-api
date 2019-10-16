const { JSONAPI_CONTENT_TYPE } = require('../constants')
const response = require('./response')

/**
 * Enforce JSONAPI standards
 * https://jsonapi.org/format/
 */
module.exports = () => async (ctx, next) => {
  if (ctx.request.headers['content-type'] !== JSONAPI_CONTENT_TYPE) {
    response.addError(`Content-Type must be ${JSONAPI_CONTENT_TYPE}`)
    ctx.status = 400
    ctx.body = response.getResponse()
    return
  }
  await next()
  ctx.status = response.status
  ctx.response.body = response.getResponse()
  ctx.response.set({ 'Content-Type': JSONAPI_CONTENT_TYPE })
}
