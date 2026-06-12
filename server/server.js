const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");

dotenv.config();

connectDB();

const app = express();

app.use(express.json());

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("SmartNest Backend Running");
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});