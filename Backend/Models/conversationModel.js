const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const conversationSchema = new Schema(
  {
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    latestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "message",
    },
    unReadMessage: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);
const conversationModel = mongoose.model("conversation", conversationSchema);
module.exports = conversationModel;
