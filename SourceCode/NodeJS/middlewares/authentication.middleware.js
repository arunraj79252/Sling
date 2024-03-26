const db = require("../models");
const User = db.user;
const jwt = require("jsonwebtoken");
const errorCode = require("../constants/error-codes");
const { logger } = require("../utils/logger.utils");
require("dotenv").config();
const { Unauthorized, NotFound, BadRequest, Forbidden } = require("../utils/errors.js");
require("dotenv").config();
const Long = require("mongodb").Long;

// Authenticate
const authenticate = async (ctx, next) => {
  const accessToken = ctx.request.get("Authorization");
  try {
    const token = await authenticateAccessToken(accessToken);
    const user = await User.findOne({ _id: token._id });
    if (user) {
      if (user.isDisabled === 1) {
        throw new Forbidden("User is disabled", errorCode.User_disabled);
      } else {
        ctx.state.user = user;
        await next();
      }
    } else {
      throw new NotFound("User not found.", errorCode.User_not_Found);
    }
  } catch (error) {
    ctx.app.emit("error", error, ctx);
  }
};

const authenticateAccessToken = async (accessToken) => {
  if (!accessToken) {
    throw new Unauthorized("No access token provided", errorCode.No_AccessToken_provided);
  }
  if (!accessToken.startsWith("SLING")) {
    throw new Unauthorized("Invalid Access Token!", errorCode.Invalid_Access_Token);
  }
  const token = await checkTokenValidity(accessToken.replace("SLING ", "")).catch((error) => {
    if (error.message === "jwt expired") throw new Unauthorized("Authorization Token Expired", errorCode.Token_expired);
    else {
      throw new Unauthorized("Invalid Access Token!", errorCode.Invalid_Access_Token);
    }
  });
  return token;
};

// Check token Validity
function checkTokenValidity(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.userAccessTokenSecret, function (error, decoded) {
      if (decoded) {
        resolve(decoded);
      } else {
        reject(error);
      }
    });
  });
}

module.exports = { authenticate, authenticateAccessToken };
