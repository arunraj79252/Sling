const { BadRequest } = require("../utils/errors");
const userService = require("../services/user-service");
const { userValidator } = require("../validators/user.validator");

//Upload image to server
exports.uploadProfileImage = async (ctx) => {
  try {
    const response = await userService.uploadProfileImage(ctx);
    ctx.body = response;
  } catch (error) {
    ctx.app.emit("error", error, ctx);
  }
};

//Delete image from server
exports.deleteImage = async (ctx) => {
  try {
    const response = await userService.deleteImage(ctx.request.params.file);
    ctx.body = response;
  } catch (error) {
    ctx.app.emit("error", error, ctx);
  }
};

exports.registerUser = async (ctx, next) => {
  try {
    await userValidator.registration.validateAsync(ctx.request.body).catch((error) => {
      throw new BadRequest(error.details[0].message, error.details[0].type);
    });
    const response = await userService.userRegistration(ctx.request.body);
    ctx.body = response;
  } catch (error) {
    ctx.app.emit("error", error, ctx);
  }
  await next();
};

exports.blockOrUnblockUser = async (ctx, next) => {
  try {
    await userValidator.blockUnblockUser
      .validateAsync(ctx.request.query, {
        accessToken: ctx.request.headers.authorization,
      })
      .catch((error) => {
        throw new BadRequest(error.details[0].message, error.details[0].type);
      });
    const response = await userService.toggleUserBlock(ctx.request.query, ctx.state.user);
    ctx.body = response;
  } catch (error) {
    ctx.app.emit("error", error, ctx);
  }
  await next();
};

//Search User

exports.searchUser = async (ctx, next) => {
  try {
    await userValidator.getUsersValidator.validateAsync(ctx.request.query).catch((error) => {
      throw new BadRequest(error.details[0].message, error.details[0].type);
    });
    const response = await userService.findUsers(ctx.request.query, ctx.state.user);

    ctx.body = response;
  } catch (error) {
    ctx.app.emit("error", error, ctx);
  }
  await next();
};

//view  user's profile
exports.viewUserProfile = async (ctx, next) => {
  try {
    const response = await userService.viewUserProfile(ctx.state);
    ctx.body = response;
  } catch (error) {
    ctx.app.emit("error", error, ctx);
  }
  await next();
};

exports.passwordChange = async (ctx, next) => {
  try {
    await userValidator.changePassword
      .validateAsync(ctx.request.body, {
        accessToken: ctx.request.headers.authorization,
      })
      .catch((error) => {
        throw new BadRequest(error.details[0].message, error.details[0].type);
      });
    const response = await userService.passwordChange(ctx.request, ctx.state);
    ctx.body = response;
  } catch (error) {
    ctx.app.emit("error", error, ctx);
  }
  await next();
};

exports.forgotPasswordMail = async (ctx, next) => {
  try {
    await userValidator.forgotPasswordMail.validateAsync(ctx.request.body).catch((error) => {
      throw new BadRequest(error.details[0].message, error.details[0].type);
    });
    const response = await userService.forgotPasswordMail(ctx.request);
    ctx.body = response;
  } catch (error) {
    ctx.app.emit("error", error, ctx);
  }
  await next();
};

exports.passwordReset = async (ctx, next) => {
  try {
    await userValidator.resetPassword.validateAsync(ctx.request.body).catch((error) => {
      throw new BadRequest(error.details[0].message, error.details[0].type);
    });
    const response = await userService.passwordReset(ctx.request);
    ctx.body = response;
  } catch (error) {
    ctx.app.emit("error", error, ctx);
  }
  await next();
};

//Get connected users in socket
exports.getConnectedUsers = async (ctx) => {
  try {
    ctx.body = await userService.getConnectedUsers();
  } catch (error) {
    ctx.app.emit("error", error, ctx);
  }
};

exports.updateProfile = async (ctx, next) => {
  try {
    await userValidator.editProfile.validateAsync(ctx.request.body).catch((error) => {
      console.log(error);
      throw new BadRequest(error.details[0].message, error.details[0].type);
    });
    const response = await userService.updateProfile(ctx, next);
    ctx.body = response;
  } catch (error) {
    ctx.app.emit("error", error, ctx);
  }
};

exports.deleteProfileImage = async (ctx) => {
  try {
    const response = await userService.deleteProfileImage(ctx.state);
    ctx.body = response;
  } catch (error) {
    ctx.app.emit("error", error, ctx);
  }
};

exports.updateProfileImage = async (ctx, next) => {
  try {
    const response = await userService.updateProfileImage(ctx, next);
    ctx.body = response;
  } catch (error) {
    ctx.app.emit("error", error, ctx);
  }
};
