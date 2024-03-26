const db = require("../models");
const User = db.user;
const Long = require("mongodb").Long;

exports.generateLongId = () => {
  const currentTimeInMilliseconds = Date.now();
  const uniqueId = Long.fromString(
    Math.floor(Math.random() * 100000).toString() + currentTimeInMilliseconds.toString().substring(6)
  );
  return uniqueId;
};

exports.updateUserStatus = async (userId, status) => {
  userId = userId.toString();
  const updateInfo = await User.findByIdAndUpdate(Long.fromString(userId), {
    status,
  });
  return !!updateInfo;
};

//Returns true if the given user Id is the admin of the group
exports.isGroupAdmin = (userId, membersArray) => {
  const isGroupAdmin = membersArray.find(
    (member) => member.memberId.toString() === userId.toString() && member.memberType === 1
  );
  return !!isGroupAdmin;
};

//Returns true if the given user Id belongs to the group
exports.isGroupMember = (userId, membersArray) => {
  const isGroupMember = membersArray.find((member) => member.memberId.toString() === userId.toString());
  return !!isGroupMember;
};

exports.isLastAdminInGroup = (userId, membersArray) => {
  for (const member of membersArray) {
    if (member.memberId.toString() === userId.toString()) {
      continue;
    }
    if (member.memberType !== 0) {
      return false;
    }
  }
  return true;
};
