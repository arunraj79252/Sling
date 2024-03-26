const { apiLogger } = require("../utils/logger.utils");

const apiLog = async (ctx, next) => {
  let req = ctx.request;
  const getValue = (part, o) => Object.entries(o).find(([k, v]) => k.startsWith(part))?.[1];
  apiLogger.info(
    `New Request from - 
        \tUser Agent: ${getValue("user-agent", req.headers)}
        \tRequest IP: ${req.ip}
        \tHost: ${req.headers.host}
        \tContent-Type: ${getValue("content-type", req.headers)}
        \tContent-Length: ${getValue("content-length", req.headers)}
        \tForwarded From: ${getValue("x-forwarded-for", req.headers)}
        \tRequest URL: ${req.originalUrl}
        \tRequest Method: ${req.method}
        \tRequest Body: ${JSON.stringify(req.body)} 
        \tQuery Params: ${JSON.stringify(req.query)} 
        \tParams: ${JSON.stringify(req.params)}
        \tAuthorization Token: ${req.headers.authorization ? JSON.stringify(req.headers.authorization) : "No Token"}`
  );
  await next();
};

module.exports = apiLog;
