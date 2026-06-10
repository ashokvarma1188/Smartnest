const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

connectDB();

const app = express();

app.get("/", (req, res) => {
  res.send("SmartNest Backend Running");
});

const PORT = process.env.PORT || 7000;

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});