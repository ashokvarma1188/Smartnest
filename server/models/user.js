// User data structure
const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["buyer", "owner"],
      default: "buyer",
    },

    // ✦ NEW — OTP fields (added for forgot-password flow)
    otp: {
      type: String,
      default: null,
    },
    otpExpiry: {
      type: Date,
      default: null,
    },
    // ✦ END NEW
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);