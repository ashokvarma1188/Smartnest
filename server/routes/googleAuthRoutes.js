const express  = require("express");
const passport  = require("passport");
const jwt       = require("jsonwebtoken");
const router    = express.Router();

// Step 1 — Redirect user to Google login page
router.get("/google", passport.authenticate("google", {
  scope: ["profile", "email"],
}));

// Step 2 — Google redirects back here with user data
router.get("/google/callback",
  passport.authenticate("google", { failureRedirect: "/api/auth/google/fail", session: false }),
  (req, res) => {
    const user = req.user;

    // Create JWT same as normal login
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const userInfo = encodeURIComponent(JSON.stringify({
      _id:   user._id,
      name:  user.name,
      email: user.email,
      role:  user.role,
    }));

    // Redirect to frontend with token + user in URL
    const frontendURL = process.env.NODE_ENV === "production"
      ? "https://smartnest-ashok.netlify.app"
      : "http://127.0.0.1:5500/frontend";

    res.redirect(`${frontendURL}/auth-callback.html?token=${token}&user=${userInfo}`);
  }
);

// Failure route
router.get("/google/fail", (req, res) => {
  res.status(401).json({ success: false, message: "Google login failed." });
});

module.exports = router;
