	// Property API URLs
const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");
const protect = require("../middleware/authMiddleware");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename:    (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

const {
  addProperty,
  getAllProperties,
  getMyProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
} = require("../controllers/propertyController");

router.post("/add",    protect, upload.array("images", 8), addProperty);  // ✦ multiple images
router.get("/all",     getAllProperties);
router.get("/my",      protect, getMyProperties);   // owner's own properties only — must be before /:id
router.get("/:id",     getPropertyById);
router.put("/:id",     protect, upload.array("images", 8), updateProperty); // ✦ multiple images
router.delete("/:id",  protect, deleteProperty);



module.exports = router;


// POST = Create
// GET = Read
// PUT = Update