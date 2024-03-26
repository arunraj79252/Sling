const app = require("./app");
const PORT = process.env.PORT ?? 5000;
require("dotenv").config();
require('./config/db')
require("./batch/user.batch")
const socket = require("./utils/socket-util");
const SOCKET_PORT = process.env.SOCKET_PORT ?? 5002;

app.listen(PORT, () => {
socket.connectSocket(SOCKET_PORT);
  console.log(`Server started listening on port ${PORT}`);
});
