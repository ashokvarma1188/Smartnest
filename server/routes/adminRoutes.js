const express  = require("express");
const router   = express.Router();
const adminOnly = require("../middleware/adminMiddleware");
const {
  getStats,
  getAllUsers,
  getAllPropertiesAdmin,
  deleteUser,
  setupAdmin,
  changeUserRole,
} = require("../controllers/adminController");

router.get("/stats",       adminOnly, getStats);
router.get("/users",       adminOnly, getAllUsers);
router.get("/properties",  adminOnly, getAllPropertiesAdmin);
router.delete("/users/:id",     adminOnly, deleteUser);
router.put("/users/:id/role",   adminOnly, changeUserRole);
router.post("/setup",      setupAdmin); // one-time setup — no admin auth needed (guarded by secret)

module.exports = router;
