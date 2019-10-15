
const Koa        = require('koa');
const Router     = require('@koa/router');
const bodyParser = require('koa-bodyparser');
const logger = require('koa-logger');
// const crypto     = require('crypto');
const cors       = require('@koa/cors');
const { SDK_KEY_HEADER } = require('./constants')

const featureFlags = require('./routes/featureFlags')
const dataFiles = require('./routes/dataFiles')

const app = new Koa();
const router = new Router();
app.use(bodyParser());
app.use(cors());
app.use(logger());
app.use(async (ctx, next) => {
  if (!ctx.request.headers[SDK_KEY_HEADER]) {
    ctx.throw(400, 'request missing sdk key')
  }
  await next()
})

router.get("/", async function (ctx) {
  ctx.body = 'This works?'
});

app.use(featureFlags.routes()).use(featureFlags.allowedMethods());
app.use(dataFiles.routes()).use(dataFiles.allowedMethods());
app.listen(3001);