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
      members: [{ type: Long, ref: "user" }],
      lastMessage: { type: Long, ref: "message", default: "" },
    },
    { timestamps: true }
  );
  schema.plugin(mongoosePaginate);
  schema.plugin(mongooseAggregatePaginate);
  const conversation = mongoose.model("conversation", schema);
  return conversation;
};
