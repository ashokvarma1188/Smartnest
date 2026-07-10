const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");
const session = require("express-session");
const passport = require("./config/passport");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const googleAuthRoutes = require("./routes/googleAuthRoutes");
const testRoutes = require("./routes/testRoutes");
const propertyRoutes = require("./routes/propertyRoutes");
const cors = require("cors");

dotenv.config();
connectDB();

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

const app = express();
app.use(cors());
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || "smartnestsession",
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use("/api/auth", authRoutes);
app.use("/api/auth", googleAuthRoutes);
app.use("/api/test", testRoutes);
app.use("/api/property", propertyRoutes);

app.get("/", (req, res) => {
  res.send("SmartNest Backend Running");
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
