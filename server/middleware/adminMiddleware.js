const protect = require("./authMiddleware");

const adminOnly = async (req, res, next) => {
  // First run the normal JWT auth check
  protect(req, res, async () => {
    if (req.user && req.user.role === "admin") {
      return next();
    }
    return res.status(403).json({ success: false, message: "Admin access required" });
  });
};

module.exports = adminOnly;
