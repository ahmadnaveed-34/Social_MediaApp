const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userFollowingSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true, // Ensure a userId is always provided
  },
  followingList: [
    {
      name: {
        type: String,
        default: null,
      },
      // Optionally include userPic and userName if you want faster access
      userPic: {
        type: String,
        default: null, // Optional, can fetch from User if needed
      },
      userName: {
        type: String,
        default: null, // Optional, can fetch from User if needed
      },
    },
  ],
});

// Use pluralized model name
const UserFollowings = mongoose.model("UserFollowings", userFollowingSchema);

module.exports = UserFollowings;
