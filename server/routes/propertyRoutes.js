const express = require("express");
const router = express.Router();

const {
  addProperty,
  getAllProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
} = require("../controllers/propertyController");

router.post("/add", addProperty);

router.get("/all", getAllProperties);

router.get("/:id", getPropertyById);

router.put("/:id", updateProperty);

router.delete("/:id", deleteProperty);



module.exports = router;


// POST = Create
// GET = Read
// PUT = Update