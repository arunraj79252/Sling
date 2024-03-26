const db = require("../models");
const Message = db.message;
const User = db.user;
const Conversation = db.conversation;
const Long = require("mongodb").Long;
const errorCode = require("../constants/error-codes");
const RegexEscape = require("regex-escape");
const { GeneralError, NotFound, BadRequest } = require("../utils/errors");
const { generateLongId } = require("../utils/user.util");
const messageTypes = require("../constants/message-types");
const { sendChatNotification } = require("../utils/socket-util");

exports.sendMessage = async (ctx) => {
  const recipientId = Long.fromString(ctx.request.body.recipientId);
  const message = ctx.request.body.message.trim();
  const blockedUsers = ctx.state.user.blockedUsers;

  //checks if recpient is blocked by the sender
  if (blockedUsers.includes(recipientId)) {
    throw new BadRequest("Recipient is blocked", errorCode.Recipient_blocked);
  }
  const senderId = ctx.state.user._id;
  const recipientUser = await User.findOne({ _id: recipientId });
  if (!recipientUser) {
    throw new NotFound("Recipient not found.", errorCode.Recipient_ID_not_found);
  }
  //checks if sender is blocked by the recpient
  if (recipientUser.blockedUsers.includes(senderId)) {
    throw new BadRequest("Unable to send message.", errorCode.Blocked_by_recipient);
  }

  const conversationId = generateLongId();
  const messageId = generateLongId();

  //Create a new conversation or update existing conversation
  const updatedConversation = await Conversation.findOneAndUpdate(
    {
      $or: [
        {
          members: {
            $eq: [senderId, recipientId],
          },
        },
        {
          members: {
            $eq: [recipientId, senderId],
          },
        },
      ],
    },
    {
      $setOnInsert: { _id: conversationId, members: [senderId, recipientId] },
      lastMessage: messageId,
    },

    {
      projection: { members: 1 },
      upsert: true,
      new: true,
      lean: true,
    }
  );
  if (!updatedConversation) {
    throw new GeneralError("An unexpected error has occurred", 500);
  }

  const messageObject =
    message !== ""
      ? {
          _id: messageId,
          conversationId: updatedConversation._id,
          messageType: messageTypes.textMessage,
          sender: senderId,
          body: message,
          messageIndex: (await Message.findOne({ conversationId }).count()) + 1,
        }
      : {};
  await Message.create(messageObject);

  //Send notification to recipient user
  if (recipientId.toString() !== senderId.toString()) {
    sendChatNotification(senderId, recipientId, message);
  }
  const newMessage = await Message.findOne({ _id: messageId }).lean();
  newMessage.sender = newMessage.sender.toString();
  return newMessage;
};

exports.readMessage = async (ctx) => {
  const {
    params: { partnerId },
    state: { user: currentUser },
  } = ctx;
  const partner = Long.fromString(partnerId);
  const blockedUsers = ctx.state.user.blockedUsers;
  if (blockedUsers.includes(partnerId)) {
    throw new BadRequest("Recipient is blocked", errorCode.Recipient_blocked);
  }
  const conversation = await Conversation.findOne({
    $or: [
      {
        members: {
          $eq: [currentUser, partner],
        },
      },
      {
        members: {
          $eq: [partner, currentUser],
        },
      },
    ],
  });
  if (!conversation) {
    throw new NotFound("No conversation exist with the given partnerId", errorCode.Message_not_found);
  }
  await Message.updateMany({ conversationId: conversation._id }, { $set: { isRead: 1 } }, { new: true });
  return { message: "Messages marked as read successfully" };
};

exports.editMessage = async (ctx) => {
  const messageId = Long.fromString(ctx.request.body.messageId);
  const message = ctx.request.body.message;
  const sender = ctx.state.user;
  const messageDocument = await Message.findOneAndUpdate(
    { _id: messageId, sender: sender._id, deleted: 0 },
    { $set: { body: message, edited: 1 } },
    { lean: true, new: true }
  );
  if (!messageDocument) {
    throw new BadRequest("Message not found or not sent by user.", errorCode.Unable_to_delete_message);
  }
  return messageDocument;
};

//view conversation with user
exports.getAllMessages = async (ctx) => {
  const customLabels = {
    limit: "pageSize",
    page: "pageNumber",
  };
  let { page, size = 10, keyword } = ctx.request.query;
  const recipientId = Long.fromString(ctx.request.query.id);
  let pageNumber = page ? Number(page) : 1;
  let limit = Number(size);
  const userId = ctx.state.user._id;
  const blockedUsers = ctx.state.user.blockedUsers;
  if (blockedUsers.includes(recipientId)) {
    throw new BadRequest("Recipient is blocked", errorCode.Recipient_blocked);
  }
  const conversationId = generateLongId();
  const conversation = await Conversation.findOneAndUpdate(
    {
      $or: [
        {
          members: {
            $eq: [userId, recipientId],
          },
        },
        {
          members: {
            $eq: [recipientId, userId],
          },
        },
      ],
    },
    {
      $setOnInsert: { _id: conversationId, members: [userId, recipientId] },
    },

    {
      projection: { members: 1 },
      upsert: true,
      new: true,
      lean: true,
    }
  ).lean();
  const recipientUser = await User.findOne({ _id: recipientId });
  if (!recipientUser) {
    throw new BadRequest("Recipient not found", errorCode.Recipient_ID_not_found);
  }
  let receiver = {
    receiverId: recipientUser._id.toString(),
    receiverEmail: recipientUser.email,
    receiverName: recipientUser.name,
    profileImage: recipientUser.profileImage,
  };
  await Message.updateMany(
    { conversationId: conversation._id, sender: recipientId },
    { $set: { isRead: 1 } },
    { new: true }
  );
  let matchParams = { conversationId: conversation._id };
  if (keyword) {
    matchParams.$or = [{ "message.body": { $regex: RegexEscape(keyword), $options: "i" } }];
  }
  const response = await Message.paginate(matchParams, {
    page: pageNumber,
    limit,
    customLabels,
    sort: { timestamp: -1 },
    lean: true,
  });
  conversation.message = response.docs;
  response.docs = conversation;
  response.docs.totalMessageCount = response.totalDocs;
  response.docs.receiver = receiver;

  return response;
};

exports.deleteMessage = async (ctx) => {
  const {
    request: {
      params: { id },
    },
    state: { user: sender },
  } = ctx;
  const messageDocument = await Message.findOneAndUpdate(
    { _id: Long.fromString(id), sender: sender._id, deleted: 0 },
    { $set: { body: "Message deleted by its author", deleted: 1 } }
  );

  if (!messageDocument) {
    throw new BadRequest("Message not found or not sent by current user.", errorCode.Unable_to_delete_message);
  }
  return messageDocument;
};

//view all messages
exports.viewMessages = async (ctx) => {
  let { page = 1, size = 10 } = ctx.request.query;
  let limit = Number(size);
  const userId = ctx.state.user._id;
  const blockedUsers = ctx.state.user.blockedUsers;

  try {
    const allMessagesAggregate = Conversation.aggregate()
      .match({ members: { $elemMatch: { $eq: userId } }, lastMessage: { $ne: null } })
      .match({ members: { $nin: blockedUsers } })
      .lookup({
        from: "messages",
        localField: "lastMessage",
        foreignField: "_id",
        as: "lastMessage",
      })
      .lookup({
        from: "users",
        localField: "members",
        foreignField: "_id",
        as: "userDetails",
      })
      .lookup({
        from: "messages",
        let: { conversationId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$conversationId", "$$conversationId"],
              },
            },
          },
        ],
        as: "messages",
      })
      .project({
        _id: 1,
        members: 1,
        message: { $arrayElemAt: ["$lastMessage", 0] },
        userDetails: 1,
        unreadCount: {
          $size: {
            $filter: {
              input: "$messages",
              as: "message",
              cond: {
                $and: [{ $eq: ["$$message.isRead", 0] }, { $ne: ["$$message.sender", userId] }],
              },
            },
          },
        },
        totalMessageCount: { $size: "$messages" },
      });

    const allMessagesPaginated = await Conversation.aggregatePaginate(allMessagesAggregate, {
      page,
      limit,
      collation: { locale: "en", strength: 2 },
    });

    for (const record of allMessagesPaginated.docs) {
      record._id = record._id.toString();
      let senderIdIndex = 0,
        recieverIdIndex = 0,
        partnerIdIndex = 0;

      if (record.message) {
        if (record.userDetails.length > 1) {
          senderIdIndex = record.userDetails.findIndex(
            (member) => member._id.toString() === record.message.sender.toString()
          );
          recieverIdIndex = senderIdIndex === 0 ? 1 : 0;
          partnerIdIndex =
            record.userDetails.findIndex((member) => member._id.toString() === userId.toString()) === 0 ? 1 : 0;
        }

        record.message.receiverId = record.userDetails[recieverIdIndex]._id.toString();
        record.message.receiverEmail = record.userDetails[recieverIdIndex].email;
        record.message.receiverName = record.userDetails[recieverIdIndex].name;
        record.message.receiverProfileImage = record.userDetails[recieverIdIndex].profileImage;
        record.message.senderName = record.userDetails[senderIdIndex].name;
      } else record.message = [];
      // Chat partner details
      record.partnerId = record.userDetails[partnerIdIndex]._id.toString();
      record.partnerName = record.userDetails[partnerIdIndex].name;
      record.partnerEmail = record.userDetails[partnerIdIndex].email;
      record.partnerProfileImage = record.userDetails[partnerIdIndex].profileImage;
      delete record.userDetails;
    }
    return allMessagesPaginated;
  } catch (error) {
    console.log(error);
    throw new BadRequest(`An unexpected error has occurred while fetching. Error: ${error}`, 400);
  }
};

//To search for a message globally among all convos
exports.searchMessage = async (ctx) => {
  const keyword = ctx.request.query.keyword;
  const page = ctx.request.query.page ?? 1;
  const limit = ctx.request.query.limit ?? 10;
  const currentUser = ctx.state.user;
  const conversationIds = await Conversation.find({
    members: { $elemMatch: { $eq: currentUser._id } },
  }).distinct("_id");

  const searchResults = await Message.paginate(
    {
      conversationId: { $in: conversationIds },
      body: { $regex: RegexEscape(keyword), $options: "i" },
    },
    {
      page,
      limit,
      collation: { locale: "en", strength: 2 },
      populate: { path: "sender", select: "name profileImage" },
      sort: { timestamp: -1 },
      lean: true,
    }
  );

  return searchResults;
};
