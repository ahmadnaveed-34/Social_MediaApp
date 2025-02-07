const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    DOB: {
      type: Date,
      default: null,
    },
    picture: {
      type: String,
      default: "Not set",
    },
    gender: {
      type: String,
      default: "Not set",
    },
    profileCoverPic: {
      type: String,
      default: "Not set",
    },
  },
  { timestamps: true }
);
const User = mongoose.model("User", userSchema);
module.exports = User;
