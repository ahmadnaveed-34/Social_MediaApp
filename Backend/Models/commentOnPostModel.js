const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentSchema = new Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "post",
    },
    comments: [
      {
        user: {
          type: String, // Reference to the User schema
          default: null,
        },
        userPic: {
          type: String,
          default: null,
        },
        name: {
          type: String,
          default: null,
        },
        userName: {
          type: String,
          default: null,
        },
        text: {
          type: String,
          default: null,
        },
      },
    ],
  },
  { timestamps: true }
);
const commentModel = mongoose.model("comment", commentSchema);
module.exports = commentModel;
