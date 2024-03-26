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
      email: String,
      phoneNo: { type: Number, default: null },
      password: { type: String, default: "" },
      currentStatus: { type: Number, default: 0 },
      profileImage: { type: String, default: "" },
      status: { type: Number, default: 1 }, //0-away, 1-online,
      blockedUsers: [{ type: Long, ref: "user", default: [] }],
      socketId: { type: String, default: null },
      isDisabled: { type: Number, default: 0 }, // 0-not disabled, 1-disabled
      passwordTempToken: { type: String, default: "" },
    },
    { timestamps: true }
  );
  schema.plugin(mongoosePaginate);
  const user = mongoose.model("user", schema);
  return user;
};
