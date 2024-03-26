const RegexEscape = require("regex-escape");
const db = require("../models");
const Group = db.group;
const GroupMessage = db.groupMessage;
const { generateLongId, isGroupAdmin, isGroupMember, isLastAdminInGroup } = require("../utils/user.util");
const Long = require("mongodb").Long;
const errorCode = require("../constants/error-codes");
const { NotFound, BadRequest } = require("../utils/errors");
const { sendGroupChatNotification } = require("../utils/socket-util");
const messageTypes = require("../constants/message-types");
const errorCodes = require("../constants/error-codes");
const { deleteFile, moveImageFromTemp } = require("../utils/image-upload.util");
const s3ImageStorageBaseUrl = process.env.AWS_GROUP_IMAGE_STORAGE_BASE_URL;

exports.createGroup = async (ctx) => {
  const { name, members = [], image } = ctx.request.body;
  const groupId = generateLongId();
  if (members.some((id) => id === ctx.state.user._id.toString())) {
    throw new BadRequest(
      "Members array should not contain the userId of the current User",
      errorCode.Group_members_should_not_contain_current_user
    );
  }
  if (image) {
    await moveImageFromTemp(image, groupId.toString(), "group").catch((error) => {
      throw new BadRequest(error.message, error.errorCode);
    });
  }
  const groupMembers = members.map((memberId) => ({
    memberId: Long.fromString(memberId),
    memberType: 0,
  }));
  groupMembers.unshift({
    memberId: ctx.state.user._id,
    memberType: 1,
  });
  const newGroup = new Group({
    _id: groupId,
    name,
    members: groupMembers,
    image: image ? `${s3ImageStorageBaseUrl}/${groupId.toString()}/${image}` : "",
  });
  await newGroup.save();
  return Group.findOne({ _id: groupId }).lean();
};

exports.editGroup = async (ctx) => {
  const groupId = Long.fromString(ctx.request.body.groupId);
  const { name, image } = ctx.request.body;
  const currentUserId = ctx.state.user._id;
  const group = await Group.findOne({ _id: groupId, isDeleted: 0 });
  if (!group) {
    throw new NotFound("Group not found", errorCodes.Group_does_not_exist);
  }
  if (!isGroupMember(currentUserId, group.members)) {
    throw new BadRequest("User does not belong to the given group", errorCodes.User_does_not_belong_to_group);
  }
  const existingGroupImage = group.image !== "" ? group.image.split(`/${groupId}/`)[1] : null;
  if (image && image !== existingGroupImage) {
    await moveImageFromTemp(image, groupId.toString(), "group").catch((error) => {
      throw new BadRequest(error.message, error.errorCode);
    });
    if (existingGroupImage !== null) await deleteFile(group.image);
    group.image = `${s3ImageStorageBaseUrl}/${groupId.toString()}/${image}`;
  }
  group.name = name;
  await group.save();
  return Group.findOne({ _id: groupId }).lean();
};

exports.deleteGroupImage = async (ctx) => {
  const groupId = Long.fromString(ctx.request.params.groupId);
  const currentUser = ctx.state.user;
  const group = await Group.findOne({ _id: groupId, isDeleted: 0 });
  if (!group) {
    throw new NotFound("Group not found", errorCodes.Group_does_not_exist);
  }
  if (!isGroupMember(currentUser._id, group.members)) {
    throw new BadRequest("User does not belong to the given group", errorCodes.User_does_not_belong_to_group);
  }
  await deleteFile(group.image);
  group.image = "";
  await group.save();
  return Group.findOne({ _id: groupId }).lean();
};

//view all user's group list
exports.viewUserGroups = async (ctx) => {
  let { page, limit } = ctx.request.query;
  page = page ?? 1;
  limit = limit ?? 10;
  let matchParams = { isDeleted: 0, members: { $elemMatch: { memberId: ctx.state.user._id } } };
  if (ctx.request.query.keyword) {
    matchParams.name = { $regex: RegexEscape(ctx.request.query.keyword), $options: "i" };
  }
  const userGroups = await Group.paginate(matchParams, {
    page,
    limit,
    collation: { locale: "en", strength: 2 },
    projection: { _id: 1, name: 1, lastMessage: 1 },
    populate: "lastMessage",
    lean: true,
  });
  return userGroups;
};

//View info about a group
exports.viewGroupInfo = async (groupId, currentUserId) => {
  const group = await Group.findOne({
    _id: Long.fromString(groupId),
    members: { $elemMatch: { memberId: currentUserId } },
    isDeleted: 0,
  }).populate({path:"members.memberId", select: "name email profileImage"}).lean();
  if (!group) {
    throw new NotFound("Group not found", errorCodes.Group_does_not_exist);
  } else {
    return group;
  }
};

exports.changeGroupAdmin = async (ctx) => {
  const { groupId, memberId, memberType } = ctx.request.query;
  const currentUserId = ctx.state.user._id.toString();
  const group = await Group.findOne({ _id: Long.fromString(groupId), isDeleted: 0 });
  if (!group) {
    throw new NotFound("Group not found", errorCodes.Group_does_not_exist);
  }
  if (!isGroupAdmin(currentUserId, group.members)) {
    throw new BadRequest(
      "Only the group admin can make / dismiss a member as admin",
      errorCode.Only_admin_can_change_member_status
    );
  }
  if (memberType === "0" && !isGroupAdmin(memberId, group.members)) {
    throw new BadRequest(
      "The given memberId is not an admin",
      errorCode.Given_member_not_admin
    );
  }
  const memberInGroup = group.members.find((member) => member.memberId.toString() === memberId);
  if (!memberInGroup) {
    throw new BadRequest("Given member does not belong to the group", errorCode.Group_does_not_contain_member);
  }
  if (memberType === "0" && isLastAdminInGroup(currentUserId, group.members)) {
    throw new BadRequest("Group should have at least one admin", errorCode.Group_must_contain_atleast_one_admin);
  }
  memberInGroup.memberType = memberType;
  await group.save();
  return Group.findOne({ _id: groupId }).lean();
};

//Send message in group
exports.sendMessageInGroup = async (ctx) => {
  const sender = ctx.state.user;
  const groupId = Long.fromString(ctx.request.body.groupId);
  const messageBody = ctx.request.body.message.trim();
  const groupMessageId = generateLongId();
  const group = await Group.findOne({ _id: groupId, isDeleted: 0 });
  if (!group) {
    throw new NotFound("Group not found", errorCode.Group_does_not_exist);
  }
  if (!isGroupMember(sender._id, group.members)) {
    throw new BadRequest("User does not belong to the given group", errorCode.User_does_not_belong_to_group);
  }
  const message = {
    _id: groupMessageId,
    groupId,
    messageType: messageTypes.textMessage,
    sender: sender._id,
    body: messageBody,
    messageIndex: (await GroupMessage.findOne({ groupId }).count()) + 1,
  };
  await GroupMessage.create(message);
  await Group.updateOne({ _id: groupId }, { $set: { lastMessage: groupMessageId } });

  //Send message notification to group members
  sendGroupChatNotification(sender, group, messageBody, false);

  const response = await GroupMessage.findOne({ _id: groupMessageId }).lean();
  return response;
};

exports.addMembers = async (ctx) => {
  const groupId = ctx.request.params.groupId;
  const members = ctx.request.body.members ?? [];
  const currentUserId = ctx.state.user._id.toString();
  // if (members.some((id) => id === currentUserId)) {
  //   throw new BadRequest(
  //     "Members array should not contain the userId of the current User",
  //     errorCode.Group_members_should_not_contain_current_user
  //   );
  // }

  const group = await Group.findOne({ _id: groupId, isDeleted: 0 }).lean();
  if (!group) {
    throw new NotFound("Group with given ID does not exist.", errorCode.Group_not_found);
  }
  if (!isGroupAdmin(currentUserId, group.members))
    throw new BadRequest(
      "Only the group admin can add members to group.",
      errorCode.Group_members_can_be_added_by_admin_only
    );
  const existingGroupMembers = group.members.map((member) => member.memberId.toString());
  if (existingGroupMembers.length + members.length > 50)
    throw new BadRequest("Group cannot consist of more than 50 members.", errorCode.Group_members_max_limit_reached);
  const excludedDuplicates = members.filter((value) => !existingGroupMembers.includes(value));
  const groupMembers = excludedDuplicates.map((memberId) => ({
    memberId: Long.fromString(memberId),
    memberType: 0,
  }));
  return Group.findOneAndUpdate({ _id: groupId }, { $push: { members: groupMembers } }, { lean: true, new: true });
};

exports.removeMember = async (ctx) => {
  const { groupId, memberId } = ctx.request.params;
  let nextAdmin = null;
  const currentUserId = ctx.state.user._id.toString();
  const group = await Group.findOne({ _id: groupId, isDeleted: 0 }).lean();
  if (!group) {
    throw new NotFound("Group not found", errorCode.Group_does_not_exist);
  }
  if (!isGroupAdmin(currentUserId, group.members) && currentUserId !== memberId)
    throw new BadRequest(
      "Only the group admin can remove members from group.",
      errorCode.Group_members_can_be_removed_by_admin_only
    );
  const memberIndex = group.members.findIndex((member) => member.memberId.toString() === memberId);
  if (memberIndex === -1) {
    throw new BadRequest("Member with given ID does not exist in group.", errorCode.Group_does_not_contain_member);
  }
  const remainingGroupAdmins = group.members.filter(
    (member) => member.memberType === 1 && member.memberId.toString() !== memberId
  );
  if (remainingGroupAdmins.length === 0) {
    nextAdmin = group.members.reduce((earliest, current) => {
      if (current.memberId.toString() !== memberId && new Date(current.addedDate) <= new Date(earliest.addedDate)) {
        return current;
      }
      return earliest;
    });
  } else nextAdmin = remainingGroupAdmins[0];
  nextAdmin.memberId = nextAdmin.memberId.toString();
  if (group.members.length === 1)
    throw new BadRequest("Group must contain atleast one member", errorCode.Group_must_contain_atleast_one_member);
  const updateInfo = await Group.bulkWrite([
    {
      updateOne: {
        filter: { _id: Long.fromString(groupId) },
        update: { $pull: { members: { memberId } } },
      },
    },
    {
      updateOne: {
        filter: { _id: Long.fromString(groupId), "members.memberId": Long.fromString(nextAdmin.memberId) },
        update: { $set: { "members.$.memberType": 1 } },
      },
    },
  ]);
  if (updateInfo.result.ok === 1) return { message: "User removed from group successfully!" };
};

// Edit group message
exports.editMessage = async (ctx) => {
  try {
    const message = ctx.request.body.message;
    const groupId = Long.fromString(ctx.request.body.groupId);
    const messageId = Long.fromString(ctx.request.body.messageId);
    const sender = ctx.state.user;

    const group = await Group.findOne({ _id: groupId, isDeleted: 0 });
    if (!group) {
      throw new NotFound("Group does not exist", errorCode.Group_does_not_exist);
    }
    if (!isGroupMember(sender._id, group.members)) {
      throw new BadRequest("User does not belong to the given group", errorCodes.User_does_not_belong_to_group);
    }
    const updatedGroupMessage = await GroupMessage.findOneAndUpdate(
      { _id: messageId, groupId, deleted: 0, sender: sender._id },
      { $set: { body: message, edited: 1 } },
      { lean: true, new: true }
    );
    if (!updatedGroupMessage) {
      throw new BadRequest(
        "Message not found or not sent by current user.",
        errorCode.Message_not_found_or_not_sent_by_user
      );
    }
    return updatedGroupMessage;
  } catch (error) {
    throw new BadRequest(error.message, error.error_code ?? 500);
  }
};

//Delete Group message
exports.deleteMessage = async (ctx) => {
  const groupId = Long.fromString(ctx.request.params.groupId);
  const messageId = Long.fromString(ctx.request.params.messageId);
  const sender = ctx.state.user;
  const group = await Group.findOne({ _id: groupId, isDeleted: 0 });
  if (!group) {
    throw new NotFound("Group does not exist", errorCode.Group_does_not_exist);
  }
  if (!isGroupMember(sender._id, group.members)) {
    throw new BadRequest("User does not belong to the given group", errorCodes.User_does_not_belong_to_group);
  }
  const updatedGroupMessage = await GroupMessage.findOneAndUpdate(
    { _id: messageId, groupId, deleted: 0, sender: sender._id },
    { $set: { body: "Message deleted by its author", deleted: 1 } },
    { lean: true, new: true }
  );
  if (!updatedGroupMessage) {
    throw new BadRequest(
      "Message not found or not sent by current user.",
      errorCode.Message_not_found_or_not_sent_by_user
    );
  }
  return updatedGroupMessage;
};

//Send Message in thread
exports.sendMessageInThread = async (ctx) => {
  try {
    const body = ctx.request.body.message.trim();
    const groupId = Long.fromString(ctx.request.body.groupId);
    const messageId = Long.fromString(ctx.request.body.messageId);
    const sender = ctx.state.user;

    const threadId = generateLongId();
    const group = await Group.findOne({ _id: groupId, isDeleted: 0 });
    if (!group) {
      throw new NotFound("Group not found.", errorCode.Group_does_not_exist);
    }
    if (!isGroupMember(sender._id, group.members)) {
      throw new BadRequest("User does not belong to the given group", errorCodes.User_does_not_belong_to_group);
    }

    const thread = {
      _id: threadId,
      sender: sender._id,
      body: body,
    };
    const updatedGroupMessage = await GroupMessage.findOneAndUpdate(
      { _id: messageId, groupId, deleted: 0 },
      { $addToSet: { threadFollowers: sender._id }, $push: { threads: thread } },
      { lean: true, new: true }
    );

    if (!updatedGroupMessage) {
      throw new NotFound("Message does not exist", errorCode.Message_not_found);
    }

    // Send notification for thread message
    sendGroupChatNotification(sender, group, body, true, updatedGroupMessage.threadFollowers);

    return updatedGroupMessage;
  } catch (error) {
    throw error;
  }
};

//Edit thread message
exports.editThreadMessage = async (ctx) => {
  try {
    const message = ctx.request.body.message;
    const messageId = Long.fromString(ctx.request.body.messageId);
    const groupId = Long.fromString(ctx.request.body.groupId);
    const threadId = Long.fromString(ctx.request.body.threadId);
    const sender = ctx.state.user;

    const group = await Group.findOne({ _id: groupId, isDeleted: 0 });
    if (!group) {
      throw new NotFound("Group does not exist", errorCode.Group_does_not_exist);
    }
    if (!isGroupMember(sender._id, group.members)) {
      throw new BadRequest("User does not belong to the given group", errorCodes.User_does_not_belong_to_group);
    }
    const updatedGroupMessage = await GroupMessage.findOneAndUpdate(
      {
        _id: messageId,
        groupId,
        deleted: 0,
        threads: {
          $elemMatch: {
            _id: threadId,
            sender: sender._id,
            deleted: 0,
          },
        },
      },
      { $set: { "threads.$.body": message, "threads.$.edited": 1 } },
      { lean: true, new: true }
    );
    if (!updatedGroupMessage) {
      throw new BadRequest(
        "Message not found or not sent by current user.",
        errorCode.Message_not_found_or_not_sent_by_user
      );
    }
    return updatedGroupMessage;
  } catch (error) {
    throw new BadRequest(error.message, error.error_code ?? 500);
  }
};

//Delete thread message
exports.deleteThreadMessage = async (ctx) => {
  try {
    const sender = ctx.state.user;
    const threadId = Long.fromString(ctx.request.params.threadId);
    const messageId = Long.fromString(ctx.request.params.messageId);
    const groupId = Long.fromString(ctx.request.params.groupId);

    const group = await Group.findOne({ _id: groupId, isDeleted: 0 });
    if (!group) {
      throw new NotFound("Group not found", errorCode.Group_does_not_exist);
    }
    if (!isGroupMember(sender._id, group.members)) {
      throw new BadRequest("User does not belong to the given group", errorCodes.User_does_not_belong_to_group);
    }
    const deletedGroupThreadMessage = await GroupMessage.findOneAndUpdate(
      {
        _id: messageId,
        groupId,
        deleted: 0,
        threads: {
          $elemMatch: {
            _id: threadId,
            sender: sender._id,
            deleted: 0,
          },
        },
      },
      {
        $set: {
          "threads.$.body": "Message deleted by its author",
          "threads.$.deleted": 1,
        },
      },
      { lean: true, new: true }
    );
    if (!deletedGroupThreadMessage) {
      throw new BadRequest(
        "Message not found or not sent by current user.",
        errorCode.Message_not_found_or_not_sent_by_user
      );
    }
    return deletedGroupThreadMessage;
  } catch (error) {
    throw new BadRequest(error.message, error.error_code ?? 500);
  }
};

exports.deleteGroup = async (ctx) => {
  const { groupId } = ctx.request.params;
  const currentUserId = ctx.state.user._id;
  const group = await Group.findOne({ _id: groupId, isDeleted: 0 });
  if (!group) {
    throw new NotFound("Group does not exist", errorCode.Group_does_not_exist);
  }
  if (!isGroupAdmin(currentUserId, group.members))
    throw new BadRequest("Only the group admin can delete group.", errorCode.Only_admin_can_delete_group);
  group.isDeleted = 1;
  await group.save();
  return { message: "Group deleted successfully!" };
};

exports.viewGroupMessages = async (ctx) => {
  const groupId = Long.fromString(ctx.request.params.groupId);
  const { page = 1, limit = 10 } = ctx.request.query;
  const currentUser = ctx.state.user;
  let group = await Group.aggregate([
    {
      $match: {
        _id: groupId,
      },
    },
    {
      $lookup: {
        from: "groupmessages",
        localField: "_id",
        foreignField: "groupId",
        as: "messages",
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        image: 1,
        members: 1,
        isDeleted: 1,
        unreadCount: {
          $size: {
            $filter: {
              input: "$messages",
              as: "message",
              cond: {
                $and: [
                  { $eq: ["$$message.deleted", 0] }, // Only consider messages that are not deleted
                  { $not: { $in: [currentUser._id, "$$message.readBy"] } },
                  { $ne: ["$$message.sender", currentUser._id] },
                ],
              },
            },
          },
        },
      },
    },
  ]);
  if (!group?.length) {
    throw new NotFound("Group does not exist", errorCode.Group_does_not_exist);
  }
  group = group[0];
  if (!isGroupMember(currentUser._id, group.members)) {
    throw new BadRequest("User does not belong to the given group", errorCodes.User_does_not_belong_to_group);
  }
  //Adding current user to 'readBy' array of group messages.
  await GroupMessage.updateMany({ groupId }, { $addToSet: { readBy: currentUser._id } });
  const response = await GroupMessage.paginate(
    { groupId },
    {
      page,
      limit,
      collation: { locale: "en", strength: 2 },
      populate: { path: "sender", select: "name profileImage" },
      lean: true,
    }
  );
  group.message = response.docs;
  response.docs = group;
  response.docs.totalMessageCount = response.totalDocs;
  return response;
};
