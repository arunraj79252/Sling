const errorCode = require("../constants/error-codes");
const { GeneralError } = require("../utils/errors");
const { logger, apiLogger } = require("../utils/logger.utils");

const handleErrors = async (error, ctx) => {
  if (!ctx.body) {
    let log;
    if (error instanceof GeneralError) {
      log = `${error.getCode()} - 'error' - ${error.message} - ${ctx.request.originalUrl} - ${ctx.request.method} - ${
        ctx.request.ip
      }`;
      if (error.error_code === "object.unknown") error.error_code = errorCode.Unidentified_input;
      ctx.response.status = error.getCode();
      ctx.response.body = {
        status: "error",
        message: {
          error: error.message,
          error_Code: error.error_code,
        },
      };
    } else {
      log = `'error' - ${error.message} - ${ctx.request.originalUrl} - ${ctx.request.method} - ${ctx.request.ip}`;
      ctx.response.status = error.status || 500;
      ctx.response.body = {
        status: "error",
        message: {
          error: error.message,
          error_Code: error.error_code,
        },
      };
    }
    logger.error(log);
    apiLogger.error(log);
  }
};

module.exports = handleErrors;
