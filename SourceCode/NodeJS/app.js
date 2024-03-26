const Koa = require("koa");
const Router = require("koa-router");
const bodyParser = require("koa-bodyparser");
const { userRoutes, authRoutes, messageRoutes, groupRoutes } = require("./routes");
const { rateLimiter, handleErrors, apiLog, handleHeader } = require("./middlewares");
const app = new Koa();
const router = new Router();
require("dotenv").config();
const errorCode = require("./constants/error-codes");
const cors = require("@koa/cors");
const { NotFound, BadRequest } = require("./utils/errors");

app.use(cors());
app.use(rateLimiter);

//API-logger
app.use(apiLog);

app.use(
  bodyParser({
    limit: "50mb",
    onerror: (err, ctx) => {
      const invalidBodyError = new BadRequest("Invalid JSON Body", errorCode.Invalid_body);
      ctx.app.emit("error", invalidBodyError, ctx);
    },
  })
);

router.get("/health", async (ctx) => {
  ctx.body = "I'm Up!";
});

// handle content-type
app.use(handleHeader);

app.use(router.routes());
app.use(userRoutes.routes());
app.use(authRoutes.routes());
app.use(messageRoutes.routes());
app.use(groupRoutes.routes());
app.use(function () {
  throw new NotFound("API not found", errorCode.API_not_found);
});

// Error handling middleware
app.on("error", (err, ctx) => {
  handleErrors(err, ctx);
});
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    handleErrors(err, ctx);
  }
});

//validate wrong request methods
app.use(
  router.allowedMethods({
    throw: true,
    methodNotAllowed: () => ({
      message: "Method Not Allowed",
      status: 405,
      error_code: errorCode.Method_not_allowed,
    }),
    notImplemented: () => ({
      message: "Method not implemented",
      status: 501,
      error_code: errorCode.Method_not_implemented,
    }),
  })
);

module.exports = app;