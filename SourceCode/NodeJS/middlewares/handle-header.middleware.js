const errorCode = require("../constants/error-codes");
const { BadRequest } = require("../utils/errors");

const handleHeader = async (ctx, next) => {
  try {
    const fileHeaderPattern = /^multipart\/form-data;\sboundary=[$\-0-9A-Za-z]+$/;
    const requestUrl = ctx.request.originalUrl;
    const requestType =
      ctx.request.method === "POST" || ctx.request.method === "PUT";
    const isDelete = ctx.request.method === "DELETE";
    const requestHeader = ctx.request.header["content-type"] ?? "";
    if (((requestType && requestHeader !== "application/json") || requestUrl.includes("profileImage")) &&
      !fileHeaderPattern.test(requestHeader) && !isDelete)
      throw new BadRequest(
        "Please add proper content-type header for the request",
        errorCode.Invalid_content_type
      );
    else await next();
  } catch (error) {
    ctx.app.emit("error", error, ctx);
  }
};

module.exports = handleHeader;
