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
      name: String,
      image: { type: String, default: "" },
      members: [
        {
          memberId: { type: Long, ref: "user" },
          memberType: Number, //memberType = 0-normalUser 1-AdminUser
          _id: false,
          addedDate: { type: Date, default: Date.now },
        },
      ],
      lastMessage: { type: Long, ref: "groupMessage", default: null },
      isDeleted: { type: Number, default: 0 }, //0-not_deleted, 1-Deleted
    },
    { timestamps: true }
  );
  schema.plugin(mongoosePaginate);
  const group = mongoose.model("group", schema);
  return group;
};
