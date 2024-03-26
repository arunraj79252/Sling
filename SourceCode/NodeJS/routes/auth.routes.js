const authController = require("../controllers/auth.controller");

const router = require("koa-router");

const authRoutes = router();
authRoutes.prefix("/api");
authRoutes.post("/login", authController.loginUser);
authRoutes.put("/login", authController.refreshToken);
authRoutes.post("/sessions/oauth/google", authController.googleAuthHandler);

module.exports = authRoutes;
