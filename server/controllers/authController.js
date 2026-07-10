// Register, Login, Reset password logic
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ✦ NEW — nodemailer setup (added for OTP emails)
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
// Register User
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    res.status(201).json({
      success: true,
      user,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


// Login User
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid password",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.status(200).json({
      success: true,
      message: "Login Successful",
      token,
      user,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


// Reset Password
const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email.",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully.",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ═══════════════════════════════════════════════════════════
// ✦ NEW — Send OTP  (Step 1 of forgot-password flow)
//   → receives: { email }
//   → generates 6-digit OTP, saves to DB, emails it to user
// ═══════════════════════════════════════════════════════════
const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email.",
      });
    }

    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Expires 10 minutes from now
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    // Save OTP + expiry on the user document in MongoDB
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send OTP to user's email
    await transporter.sendMail({
      from: `"SmartNest" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "SmartNest — Your Password Reset OTP",
      html: `
        <div style="font-family:sans-serif;max-width:420px;margin:auto;padding:32px;background:#0F2236;border-radius:12px;color:#E8EEF3;">
          <h2 style="color:#C98A35;margin:0 0 8px;">SmartNest</h2>
          <p style="color:#9FB6C9;margin:0 0 24px;font-size:14px;">Password Reset Request</p>
          <p style="margin:0 0 8px;">Your one-time password is:</p>
          <div style="font-size:36px;font-weight:700;letter-spacing:10px;color:#C98A35;padding:16px 0;">${otp}</div>
          <p style="color:#9FB6C9;font-size:13px;margin:16px 0 0;">This code expires in <strong style="color:#E8EEF3;">10 minutes</strong>. Do not share it with anyone.</p>
        </div>
      `,
    });

    res.status(200).json({
      success: true,
      message: "OTP sent to your email.",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ═══════════════════════════════════════════════════════════
// ✦ NEW — Verify OTP  (Step 2 of forgot-password flow)
//   → receives: { email, otp }
//   → checks OTP matches DB value AND is not expired
//   → clears OTP from DB on success
// ═══════════════════════════════════════════════════════════
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Check 1 — does OTP match?
    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Incorrect OTP. Please try again.",
      });
    }

    // Check 2 — is OTP still within the 10-minute window?
    if (new Date() > user.otpExpiry) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one.",
      });
    }

    // Both checks passed — clear OTP so it cannot be reused
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: "OTP verified successfully.",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
// ✦ END NEW ─────────────────────────────────────────────────

module.exports = {
  registerUser,
  loginUser,
  resetPassword,
  sendOtp,    // ✦ NEW
  verifyOtp,  // ✦ NEW
};



