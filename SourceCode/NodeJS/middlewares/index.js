const { rateLimiter } = require("./rate-limiter.middleware");
const handleHeader = require("./handle-header.middleware");
const handleErrors = require("./handle-errors.middleware");
const apiLog = require("./apiLogger.middleware");
const { authenticate } = require("./authentication.middleware");

module.exports = {
  rateLimiter,
  handleHeader,
  handleErrors,
  apiLog,
  authenticate,
};
