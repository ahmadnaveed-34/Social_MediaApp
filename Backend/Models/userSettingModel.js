const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSettingSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  userName: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  accountType: {
    type: String,
    default: "public",
  },
  blockedUser: [
    {
      name: {
        type: String,
        default: null,
      },
      userName: {
        type: String,
        default: null,
      },
      userPicture: {
        type: String,
        default: null,
      },
    },
  ],
  theme: {
    type: String,
    default: "dark",
  },
});

const userSetting = mongoose.model("userSetting", userSettingSchema);
module.exports = userSetting;
