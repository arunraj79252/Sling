const router = require("koa-router");
const groupRoutes = router();
const groupController = require("../controllers/group.controller");
const { authenticate } = require("../middlewares");

groupRoutes.prefix("/api/group");
groupRoutes.use(authenticate);

//Create, Edit, Delete Group
groupRoutes.post("/", groupController.createGroup);
groupRoutes.put("/", groupController.editGroup);
groupRoutes.delete("/:groupId", groupController.deleteGroup);
groupRoutes.delete("/image/:groupId", groupController.deleteGroupImage);

//Add,remove member
groupRoutes.post("/:groupId/member", groupController.addMembers);
groupRoutes.delete("/:groupId/:memberId", groupController.removeMember);

//Create, Edit, Delete, View group messages
groupRoutes.get("/:groupId/message", groupController.viewGroupMessages);
groupRoutes.post("/message", groupController.sendMessage);
groupRoutes.put("/message", groupController.editMessage);
groupRoutes.delete("/:groupId/message/:messageId", groupController.deleteMessage);

//Create, Edit,delete thread message
groupRoutes.post("/message/thread", groupController.sendThreadMessage);
groupRoutes.put("/message/thread", groupController.editThreadMessage);
groupRoutes.delete("/:groupId/message/:messageId/thread/:threadId", groupController.deleteThreadMessage);

//View group info
groupRoutes.get("/:groupId", groupController.viewGroupInfo);

//View user groups
groupRoutes.get("/", groupController.viewUserGroups);

//Change member admin status
groupRoutes.patch("/changeAdmin", authenticate, groupController.changeGroupAdmin);
module.exports = groupRoutes;
