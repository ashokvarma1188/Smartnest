const express    = require("express");
const http       = require("http");
const { Server } = require("socket.io");
const dotenv     = require("dotenv");
const path       = require("path");
const fs         = require("fs");
const session    = require("express-session");
const passport   = require("./config/passport");
const connectDB  = require("./config/db");
const cors       = require("cors");

const authRoutes         = require("./routes/authRoutes");
const googleAuthRoutes   = require("./routes/googleAuthRoutes");
const testRoutes         = require("./routes/testRoutes");
const propertyRoutes     = require("./routes/propertyRoutes");
const chatRoutes         = require("./routes/chatRoutes");          // Gemini AI chatbot
const conversationRoutes = require("./routes/conversationRoutes"); // buyer-owner messaging
const adminRoutes        = require("./routes/adminRoutes");

dotenv.config();
connectDB();

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

const app        = express();
const httpServer = http.createServer(app);
const io         = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

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

app.use("/api/auth",          authRoutes);
app.use("/api/auth",          googleAuthRoutes);
app.use("/api/test",          testRoutes);
app.use("/api/property",      propertyRoutes);
app.use("/api/chat",          chatRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/admin",         adminRoutes);

app.get("/", (req, res) => res.send("SmartNest Backend Running"));

// Socket.IO — real-time chat rooms
io.on("connection", (socket) => {
  // Join a conversation room
  socket.on("join_conversation", (conversationId) => {
    socket.join(conversationId);
  });

  // Broadcast new message to everyone in the room (include conversationId for notifications)
  socket.on("send_message", ({ conversationId, message }) => {
    io.to(conversationId).emit("receive_message", { ...message, conversationId });
  });

  socket.on("disconnect", () => {});
});

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => console.log(`http://localhost:${PORT}`));
