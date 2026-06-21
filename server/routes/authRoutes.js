// Auth API URLs
const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  resetPassword,
} = require("../controllers/authController");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/reset-password", resetPassword);

module.exports = router;