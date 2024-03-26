const messageService = require("../services/message-service");
const { BadRequest } = require("../utils/errors");
const { messageValidator } = require("../validators/message.validator");

exports.sendMessage = async (ctx, next) => {
  try {
    const { error } = messageValidator.sendMessage.validate(ctx.request.body);
    if (error) throw new BadRequest(error.details[0].message, error.details[0].type);
    else {
      const response = await messageService.sendMessage(ctx);
      ctx.body = response;
    }
  } catch (error) {
    ctx.app.emit("error", error, ctx);
  }
};

/// View Message from particular User

exports.viewMessage = async (ctx, next) => {
  try {
    await messageValidator.viewMessage.validateAsync(ctx.request.query).catch((error) => {
      throw new BadRequest(error.details[0].message, error.details[0].type);
    });
    const response = await messageService.getAllMessages(ctx);
    ctx.body = response;
  } catch (error) {
    ctx.app.emit("error", error, ctx);
  }
};
exports.readMessage = async (ctx, next) => {
  try {
    const response = await messageService.readMessage(ctx);
    ctx.body = response;
  } catch (error) {
    ctx.app.emit("error", error, ctx);
  }
};
exports.editMessage = async (ctx, next) => {
  try {
    const { error } = messageValidator.editMessage.validate(ctx.request.body);
    if (error) throw new BadRequest(error.details[0].message, error.details[0].type);
    else {
      const response = await messageService.editMessage(ctx);
      ctx.body = response;
    }
  } catch (error) {
    ctx.app.emit("error", error, ctx);
  }
};
exports.deleteMessage = async (ctx, next) => {
  try {
    const response = await messageService.deleteMessage(ctx);
    ctx.body = response;
  } catch (error) {
    ctx.app.emit("error", error, ctx);
  }
};

exports.getAllMessages = async (ctx, next) => {
  try {
    const { error } = messageValidator.getMessages.validate(ctx.request.query);
    if (error) throw new BadRequest(error.details[0].message, error.details[0].type);
    else {
      const response = await messageService.viewMessages(ctx);
      ctx.body = response;
    }
  } catch (error) {
    ctx.app.emit("error", error, ctx);
  }
};

exports.searchMessage = async (ctx, next) => {
  try {
    const { error } = messageValidator.searchMessage.validate(ctx.request.query);
    if (error) throw new BadRequest(error.details[0].message, error.details[0].type);
    else {
    const response = await messageService.searchMessage(ctx);
    ctx.body = response;
    }
  } catch (error) {
    ctx.app.emit("error", error, ctx);
  }
};
