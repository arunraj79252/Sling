const mongoose = require("mongoose");
require("dotenv").config();
const { dbName, host } = process.env;
mongoose.Promise = global.Promise;
mongoose.set("strictQuery", true);
const db = {};
db.mongoose = mongoose;
db.url = `mongodb://${host}:27017/${dbName}`;
db.user = require("./user.model")(mongoose);
db.message = require("./message.model")(mongoose);
db.conversation = require("./conversation.model")(mongoose);
db.group = require("./group.model")(mongoose);
db.groupMessage = require("./groupMessage.model")(mongoose);

module.exports = db;
