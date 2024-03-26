const db = require("../models");
const User = db.user;
const Group = db.group;
const http = require("http");
const socket = require("socket.io");
const { authenticateAccessToken } = require("../middlewares/authentication.middleware");
const { logger } = require("./logger.utils");
const { updateUserStatus } = require("./user.util");
let connectedUsers = {};
let io;
const app = require("../app");

const connectSocket = (port) => {
  const socketServer = http.createServer(app);
  io = socket(socketServer, {
    transports: ["websocket", "polling"],
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
      transports: ["websocket", "polling"],
    },
    allowEIO3: true,
  });
  socketServer.listen(port, () => {
    console.log(`Socket listening on port ${port}`);
  });
  io.use(async (socket, next) => {
    try {
      const accessToken = socket.handshake.headers.authorization;
      const token = await authenticateAccessToken(accessToken);

      const user = await User.findOne({ _id: token._id }).lean();
      if (user) {
        await User.updateOne({ _id: user._id }, { $set: { socketId: socket.id } });
        connectedUsers[user._id] = socket.id;
        await updateUserStatus(user._id, 1);
        logger.info(`User: ${user._id} has been connected to Websocket: ${socket.id}`);
        return next();
      }
    } catch (error) {
      console.error(`Error while socket authentication. Error: ${error}`);
      logger.error(`Error while socket authentication. Error: ${error}`);
    }
  });

  io.on("connection", async (socket) => {
    io.to(socket.id).emit("connection", "SOCKET CONNECTED SUCCESSFULLY");

    socket.on("disconnect", async () => {
      for (const [key, value] of Object.entries(connectedUsers)) {
        if (value === socket.id) {
          logger.info(`User: ${key} has been disconnected from Websocket: ${socket.id}`);
          delete connectedUsers[key];
          await updateUserStatus(key, 0);
          break;
        }
      }
    });

    socket.on("isTyping", (data) => {
      try {
        let parsedData = JSON.parse(data);
        io.to(connectedUsers[data.userId]).emit("typingIndicator", {
          userId: parsedData.userId,
          parsedData: data.isTyping,
        });
      } catch (error) {
        logger.error(`Error when recieveing isTyping error. Data: ${data} Error: ${error}`);
      }
    });
  });
};

const disconnectSocket = () => {
  io.close();
};

function getConnectedUsers() {
  return connectedUsers;
}

const sendChatNotification = async (sender, reciever, message) => {
  try {
    const user = await User.findOne({ _id: sender }).lean();
    const messageObject = {
      senderId: user._id.toString(),
      senderName: user.name,
      senderImage: user.profileImage,
      message,
    };
    io.to(connectedUsers[reciever]).emit("chat", messageObject);
  } catch (error) {
    logger.error(error);
  }
};

const sendGroupChatNotification = async (sender, group, message, isThread = false, recipients = []) => {
  if (!isThread) recipients = group.members.filter((user) => user.toString() !== sender.toString());
  const groupMessageNotification = {
    senderId: sender._id.toString(),
    senderName: sender.name,
    groupId: group._id.toString(),
    groupName: group.name,
    groupImage: group.image,
    message,
    thread: isThread,
  };
  const socketIds = recipients.map((recipient) => connectedUsers[recipient.toString()]);
  io.to(socketIds).emit("groupChat", groupMessageNotification);
};

module.exports = {
  connectSocket,
  disconnectSocket,
  getConnectedUsers,
  sendChatNotification,
  sendGroupChatNotification,
};
