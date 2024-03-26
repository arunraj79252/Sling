const { RateLimiterMongo } = require("rate-limiter-flexible");
const mongoose = require("mongoose");
const errorCode = require("../constants/error-codes");

const rateLimiter = async (ctx, next) => {
  const db = mongoose.connection.getClient();
  const rateLimiter = new RateLimiterMongo({
    storeClient: db,
    points: 200,
    duration: 5,
    keyPrefix: "middleware",
    dbName: "sling",
    tableName: "rate-limiter",
  });
  try {
    await rateLimiter.consume(ctx.ip);
  } catch (rejRes) {
    ctx.status = 429;
    ctx.body = {
      status: "error",
      message: {
        error: "Too Many Requests",
        error_code: errorCode.Too_many_requests,
      },
    };
    return;
  }
  await next();
};

module.exports = { rateLimiter };
