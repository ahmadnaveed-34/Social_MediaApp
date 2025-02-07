const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const blockUserSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  blockUsers: [
    {
      user: {
        type: String,
        default: null,
      },
      name: {
        type: String,
        default: null,
      },
      picture: {
        type: String,
        default: null,
      },
    },
  ],
});

const blockUserModel = mongoose.model("block", blockUserSchema);
module.exports = blockUserModel;
