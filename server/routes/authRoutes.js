// Auth API URLs
const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  resetPassword,
  sendOtp,    // ✦ NEW
  verifyOtp,  // ✦ NEW
} = require("../controllers/authController");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/reset-password", resetPassword);
router.post("/send-otp", sendOtp);       // ✦ NEW — Step 1: send OTP to email
router.post("/verify-otp", verifyOtp);   // ✦ NEW — Step 2: verify OTP entered by user

module.exports = router;
