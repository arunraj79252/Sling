const mongoose = require("mongoose");
require("mongoose-long")(mongoose);
const {
  Types: { Long },
} = mongoose;
const mongoosePaginate = require("mongoose-paginate-v2");
module.exports = (mongoose) => {
  const schema = mongoose.Schema(
    {
      _id: Long,
      groupId: { type: Long, ref: "group" },
      sender: { type: Long, ref: "user" },
      messageType: { type: Number, default: 0 }, //0-textMessage, 1-file
      messageIndex: { type: Number, default: 0 },
      body: String,
      edited: { type: Number, default: 0 }, //0-not_edited, 1-Edited
      deleted: { type: Number, default: 0 }, //0-not_deleted, 1-Deleted
      forwarded: { type: Number, default: 0 }, //0-not_forwarded, 1-Forwarded
      readBy: [{ type: Long, ref: "user" }],
      timestamp: { type: Date, default: Date.now },
      threadFollowers: [{ type: Long, ref: "user", default: [] }],
      threads: [
        {
          _id: Long,
          sender: { type: Long, ref: "user" },
          body: String,
          timestamp: { type: Date, default: Date.now },
          deleted: { type: Number, default: 0 }, //0-not_deleted, 1-Deleted
          edited: { type: Number, default: 0 }, //0-not_edited, 1-Edited
          readBy: [{ type: Long, ref: "user" }],
        },
      ],
    },
    { timestamps: true }
  );
  schema.plugin(mongoosePaginate);
  const groupMessage = mongoose.model("groupMessage", schema);
  return groupMessage;
};
