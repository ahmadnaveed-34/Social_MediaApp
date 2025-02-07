const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messageSchema = new Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      default: null,
    },
    media: {
      type: String,
      default: null,
    },
    mediaType: {
      type: String,
      default: null,
    },
    readMessage: {
      type: Boolean,
      default: false,
    },
    isSharedPost: {
      type: String,
      default: null,
    },
    sharedPostId: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);
const messageModel = mongoose.model("message", messageSchema);
module.exports = messageModel;
