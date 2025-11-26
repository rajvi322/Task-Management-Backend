const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    email: { type: String },
    otp: { type: String, require: true },
    expiresAt: {
      type: Date,
      required: true,
      default: () => Date.now() + 3600000,
      expires: 3600,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("OTP", otpSchema);
