const userController = require("../controllers/user.controller");
const router = require("koa-router");
const { authenticate } = require("../middlewares");

const userRoutes = router();
userRoutes.prefix("/api/user");

userRoutes.get("/profile", authenticate, userController.viewUserProfile);
userRoutes.patch("/profileImage", userController.uploadProfileImage);
userRoutes.delete("/profileImage/:file", userController.deleteImage);
userRoutes.post("/", userController.registerUser);
userRoutes.patch("/blockUnblockUser", authenticate, userController.blockOrUnblockUser);
userRoutes.get("/", authenticate, userController.searchUser);
userRoutes.delete('/profileImage', authenticate, userController.deleteProfileImage)
userRoutes.put('/profileImage', authenticate, userController.updateProfileImage)
userRoutes.put('/', authenticate, userController.updateProfile)
userRoutes.patch("/changePassword", authenticate, userController.passwordChange);
userRoutes.patch("/resetPassword", userController.passwordReset);
userRoutes.post("/forgot-password", userController.forgotPasswordMail);
userRoutes.get("/getConnectedUsers", userController.getConnectedUsers);

module.exports = userRoutes;
