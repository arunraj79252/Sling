const db = require("../models");
const { getConnectedUsers } = require("../utils/socket-util");
const User = db.user;

module.exports = () => {
  updateUserStatus;
};

const updateUserStatus = setInterval(async () => {
  const connectedUsers = getConnectedUsers();
  const activeUsers = await User.find({ status: 1 });
  const inactiveUsers = activeUsers.filter((user) => !connectedUsers[user._id.toString()]).map((user) => user._id);
  if (inactiveUsers.length > 0) {
    await User.updateMany({ _id: { $in: inactiveUsers } }, { $set: { status: 0 } });
  }
}, 5000);
