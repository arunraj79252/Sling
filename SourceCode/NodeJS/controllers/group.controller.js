const { log } = require("winston");
const groupService = require("../services/group-service");
const { BadRequest } = require("../utils/errors");
const { groupValidator } = require("../validators/group.validator");

exports.createGroup = async (ctx) => {
  try {
    await groupValidator.createGroup.validateAsync(ctx.request.body).catch((error) => {
      throw new BadRequest(error.details[0].message, error.details[0].type);
    });

    ctx.body = await groupService.createGroup(ctx);
  } catch (error) {
    ctx.app.emit("error", error, ctx);
  }
};

exports.editGroup = async (ctx) => {
  try {
    await groupValidator.editGroup.validateAsync(ctx.request.body).catch((error) => {
      throw new BadRequest(error.details[0].message, error.details[0].type);
    });

    ctx.body = await groupService.editGroup(ctx);
  } catch (error) {
    ctx.app.emit("error", error, ctx);
  }
};

exports.deleteGroup = async (ctx) => {
  try {
    ctx.body = await groupService.deleteGroup(ctx);
  } catch (error) {
    ctx.app.emit("error", error, ctx);
  }
};

exports.deleteGroupImage = async (ctx) => {
  try {
    const response = await groupService.deleteGroupImage(ctx);
    ctx.body = response;
  } catch (error) {
    ctx.app.emit("error", error, ctx);
  }
};

exports.viewUserGroups = async (ctx) => {
  try {
    ctx.body = await groupService.viewUserGroups(ctx);
  } catch (error) {
    ctx.app.emit("error", error, ctx);
  }
};

exports.viewGroupInfo = async (ctx) => {
  try {
    ctx.body = await groupService.viewGroupInfo(ctx.request.params.groupId, ctx.state.user._id);
  } catch (error) {
    ctx.app.emit("error", error, ctx);
  }
};

exports.viewGroupMessages = async (ctx) => {
  try {
    ctx.body = await groupService.viewGroupMessages(ctx);
  } catch (error) {
    ctx.app.emit("error", error, ctx);
  }
};

exports.changeGroupAdmin = async (ctx) => {
  try {
    await groupValidator.changeGroupAdmin.validateAsync(ctx.request.query).catch((error) => {
      throw new BadRequest(error.details[0].message, error.details[0].type);
    });
    ctx.body = await groupService.changeGroupAdmin(ctx);
  } catch (error) {
    ctx.app.emit("error", error, ctx);
  }
};

exports.sendMessage = async (ctx) => {
  try {
    await groupValidator.sendMessageInGroup
      .validateAsync(ctx.request.body, {
        context: ctx,
      })
      .catch((error) => {
        throw new BadRequest(error.details[0].message, error.details[0].type);
      });
    ctx.body = await groupService.sendMessageInGroup(ctx);
  } catch (error) {
    ctx.app.emit("error", error, ctx);
  }
};

exports.addMembers = async (ctx) => {
  try {
    await groupValidator.addMembers.validateAsync(ctx.request.body).catch((error) => {
      throw new BadRequest(error.details[0].message, error.details[0].type);
    });
    ctx.body = await groupService.addMembers(ctx);
  } catch (error) {
    ctx.app.emit("error", error, ctx);
  }
};

exports.removeMember = async (ctx) => {
  try {
    ctx.body = await groupService.removeMember(ctx);
  } catch (error) {
    ctx.app.emit("error", error, ctx);
  }
};

//Edit message
exports.editMessage = async (ctx, next) => {
  try {
    const { error } = groupValidator.editMessage.validate(ctx.request.body);
    if (error) throw new BadRequest(error.details[0].message, error.details[0].type);
    else {
      const response = await groupService.editMessage(ctx);
      ctx.body = response;
    }
  } catch (error) {
    ctx.app.emit("error", error, ctx);
  }
};

//Delete message
exports.deleteMessage = async (ctx, next) => {
  try {
    const { error } = groupValidator.deleteMessage.validate(ctx.request.params);
    if (error) throw new BadRequest(error.details[0].message, error.details[0].type);
    else {
      const response = await groupService.deleteMessage(ctx);
      ctx.body = response;
    }
  } catch (error) {
    ctx.app.emit("error", error, ctx);
  }
};

//Send Thread message
exports.sendThreadMessage = async (ctx) => {
  try {
    await groupValidator.sendThreadMessage
      .validateAsync(ctx.request.body, {
        context: ctx,
      })
      .catch((error) => {
        throw new BadRequest(error.details[0].message, error.details[0].type);
      });
    ctx.body = await groupService.sendMessageInThread(ctx);
  } catch (error) {
    ctx.app.emit("error", error, ctx);
  }
};

//Edit Thread message
exports.editThreadMessage = async (ctx, next) => {
  try {
    const { error } = groupValidator.editThreadMessage.validate(ctx.request.body);
    if (error) throw new BadRequest(error.details[0].message, error.details[0].type);
    else {
      const response = await groupService.editThreadMessage(ctx);
      ctx.body = response;
    }
  } catch (error) {
    ctx.app.emit("error", error, ctx);
  }
};

//Delete Thread message
exports.deleteThreadMessage = async (ctx, next) => {
  try {
    const { error } = groupValidator.deleteThreadMessage.validate(ctx.request.params);
    if (error) throw new BadRequest(error.details[0].message, error.details[0].type);
    else {
      const response = await groupService.deleteThreadMessage(ctx);
      ctx.body = response;
    }
  } catch (error) {
    ctx.app.emit("error", error, ctx);
  }
};
