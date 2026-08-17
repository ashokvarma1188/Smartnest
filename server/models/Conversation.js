const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text:   { type: String, required: true },
}, { timestamps: true });

const conversationSchema = new mongoose.Schema({
  property: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },
  buyer:    { type: mongoose.Schema.Types.ObjectId, ref: "User",     required: true },
  owner:    { type: mongoose.Schema.Types.ObjectId, ref: "User",     required: true },
  messages: [messageSchema],
}, { timestamps: true });

// One conversation per (property + buyer) pair
conversationSchema.index({ property: 1, buyer: 1 }, { unique: true });

module.exports = mongoose.model("Conversation", conversationSchema);
