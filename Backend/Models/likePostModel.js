const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const likeSchema = new Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "post",
    },
    likes: [
      {
        user: {
          type: String,
          default: null,
        },
      },
    ],
  },
  { timestamps: true }
);
const likeModel = mongoose.model("like", likeSchema);
module.exports = likeModel;
