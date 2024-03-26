const router = require("koa-router");
const { authenticate } = require("../middlewares");
const messageController = require("../controllers/message.controller");

const messageRoutes = router();
messageRoutes.prefix("/api/message");
messageRoutes.use(authenticate);

//View message from particular user
messageRoutes.get("/viewMessage", messageController.viewMessage);

//Send message
messageRoutes.post("/", messageController.sendMessage);

//Read message
messageRoutes.patch("/read/:partnerId", messageController.readMessage);

//Edit,delete message
messageRoutes.put("/", messageController.editMessage);
messageRoutes.delete("/:id", messageController.deleteMessage);

//View all messages
messageRoutes.get("/", messageController.getAllMessages);

//Search message
messageRoutes.get("/search", messageController.searchMessage);

module.exports = messageRoutes;
