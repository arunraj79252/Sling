const { BadRequest, GeneralError, NotFound } = require("../utils/errors");
const authService = require("../services/auth-service");
const errorCode = require("../constants/error-codes");
const { userValidator } = require("../validators/user.validator");
require("dotenv").config();
const { UI_ROOT_URI } = process.env;

exports.loginUser = async (ctx, next) => {
  try {
    const { error } = userValidator.login.validate(ctx.request.body);

    if (error) {
      throw new BadRequest(error.details[0].message, error.details[0].type);
    }
    const response = await authService.userLogin(ctx.request.body);
    const { token, refreshToken } = response;
    ctx.cookies.set("access_token", token, {
      maxAge: 3600000,
      httpOnly: true,
      secure: false,
    });
    ctx.cookies.set("refresh_token", refreshToken, {
      maxAge: 86400000,
      httpOnly: true,
      secure: false,
    });
    ctx.body = response;
  } catch (error) {
    ctx.app.emit("error", error, ctx);
  }
};

exports.refreshToken = async (ctx, next) => {
  try {
    const { error } = userValidator.refreshToken.validate(ctx.request.body);
    if (error) {
      throw new BadRequest(error.details[0].message, error.details[0].type);
    }
    const response = await authService.userRefreshToken(ctx.request.body).then(ctx.request.body);
    ctx.body = response;
  } catch (error) {
    ctx.app.emit("error", error, ctx);
  }
};

exports.googleAuthHandler = async (ctx, next) => {
  try {
    const { error } = userValidator.googleSignIn.validate(ctx.request.body);
    if (error) {
      throw new BadRequest(error.details[0].message, error.details[0].type);
    }
    const { code } = ctx.request.body;
    const response = await authService.googleAuthService(code);
    ctx.body = response;
  } catch (error) {
    ctx.app.emit("error", error, ctx);
  }
};
