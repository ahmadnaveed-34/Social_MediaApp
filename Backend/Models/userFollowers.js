const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userFollowersSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true, // Ensure a userId is always provided
  },
  followersList: [
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
const UserFollowers = mongoose.model("UserFollowers", userFollowersSchema);

module.exports = UserFollowers;
