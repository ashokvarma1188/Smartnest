const express = require("express");
const router  = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  getOrCreateConversation,
  sendMessage,
  getOwnerConversations,
  getBuyerConversations,
} = require("../controllers/messageController");

router.get("/owner",                        protect, getOwnerConversations);   // owner sees all their chats
router.get("/buyer",                        protect, getBuyerConversations);   // buyer sees all their chats
router.get("/property/:propertyId",         protect, getOrCreateConversation); // buyer opens chat for a property
router.post("/:conversationId/message",     protect, sendMessage);             // send a message

module.exports = router;
