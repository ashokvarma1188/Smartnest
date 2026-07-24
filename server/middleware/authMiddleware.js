// Checks if user is logged in
const jwt = require("jsonwebtoken");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : authHeader;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    // Verify the token anthe ekkada verify ayena token frontend loke store avudhe
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET // ekkada same screat key use chesav token create chesinappudu anhte token valid ga undhaledho chusudhe
    );

    req.user = decoded;

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};

module.exports = protect;