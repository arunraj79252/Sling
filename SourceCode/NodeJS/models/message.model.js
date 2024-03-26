const mongoose = require("mongoose");
require("mongoose-long")(mongoose);
const {
  Types: { Long },
} = mongoose;
const mongoosePaginate = require("mongoose-paginate-v2");
const mongooseAggregatePaginate = require("mongoose-aggregate-paginate-v2");

module.exports = (mongoose) => {
  const schema = mongoose.Schema(
    {
      _id: Long,
      sender: { type: Long, ref: "user" },
      conversationId: { type: Long, ref: "conversation" },
      messageType: { type: Number, default: 0 }, //0-textMessage, 1-file
      body: String,
      isRead: { type: Number, default: 0 }, //0-not_Read, 1-Read
      readTimestamp: Date,
      messageIndex: { type: Number, default: 0 },
      edited: { type: Number, default: 0 }, //0-not_edited, 1-Edited
      deleted: { type: Number, default: 0 }, //0-not_deleted, 1-Deleted
      forwarded: { type: Number, default: 0 }, //0-not_forwarded, 1-Forwarded
      timestamp: { type: Date, default: Date.now },
    },
    { timestamps: true }
  );
  schema.plugin(mongoosePaginate);
  schema.plugin(mongooseAggregatePaginate);
  const message = mongoose.model("message", schema);
  return message;
};
