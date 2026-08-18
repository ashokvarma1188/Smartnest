// Auth API URLs
const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  resetPassword,
  sendOtp,
  verifyOtp,
  setupAdmin,
} = require("../controllers/authController");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/reset-password", resetPassword);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/setup-admin", setupAdmin);

module.exports = router;
