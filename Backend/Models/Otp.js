const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const otpSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  expiryTime: {
    type: Date,
    required: true,
  },
});

otpSchema.index({ expiryTime: 1 }, { expireAfterSeconds: 0 });
const Otp = mongoose.model("Otp", otpSchema);
module.exports = Otp;
