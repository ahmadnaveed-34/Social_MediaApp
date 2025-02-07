const mongoose = require("mongoose");

const groupConversationSchema = new mongoose.Schema(
  {
    groupName: {
      type: String,
      required: true,
    },
    groupPicture: {
      type: String,
      default: "", // Optional default group picture URL
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Reference to the User model
      },
    ],
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Reference to the User model
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // User who created the group
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("GroupConversation", groupConversationSchema);
