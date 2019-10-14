const Router = require('@koa/router');
const router = new Router({
  prefix: '/featureFlags'
});

router.get("/", async function (ctx) {
  ctx.body = 'This works?'
});

router.get("/:name", async function (ctx) {
  ctx.body = 'This works?'
  // ctx.params.name
});

module.exports = router