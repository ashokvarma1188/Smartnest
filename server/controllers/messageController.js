const Conversation = require("../models/Conversation");
const Property     = require("../models/property");

// GET or CREATE conversation for a buyer on a specific property
const getOrCreateConversation = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const buyerId = req.user.id;

    const property = await Property.findById(propertyId);
    if (!property) return res.status(404).json({ success: false, message: "Property not found" });

    let conversation = await Conversation.findOne({ property: propertyId, buyer: buyerId })
      .populate("buyer",  "name email")
      .populate("owner",  "name email")
      .populate("property", "title location")
      .populate("messages.sender", "name role");

    if (!conversation) {
      conversation = await Conversation.create({
        property: propertyId,
        buyer:    buyerId,
        owner:    property.owner,
        messages: [],
      });
      conversation = await Conversation.findById(conversation._id)
        .populate("buyer",  "name email")
        .populate("owner",  "name email")
        .populate("property", "title location")
        .populate("messages.sender", "name role");
    }

    res.status(200).json({ success: true, conversation });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// SEND a message in a conversation
const sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { text } = req.body;
    const senderId = req.user.id;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: "Message text is required" });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return res.status(404).json({ success: false, message: "Conversation not found" });

    // Only buyer or owner of this conversation can send messages
    const isBuyer = conversation.buyer.toString() === senderId;
    const isOwner = conversation.owner.toString() === senderId;
    if (!isBuyer && !isOwner) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const message = { sender: senderId, text: text.trim() };
    conversation.messages.push(message);
    await conversation.save();

    // Return the saved message with populated sender
    const updated = await Conversation.findById(conversationId)
      .populate("messages.sender", "name role");

    const savedMsg = updated.messages[updated.messages.length - 1];

    res.status(201).json({ success: true, message: savedMsg, conversationId });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// GET all conversations for the logged-in owner
const getOwnerConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({ owner: req.user.id })
      .populate("buyer",    "name email")
      .populate("property", "title location")
      .populate("messages.sender", "name role")
      .sort({ updatedAt: -1 });

    res.status(200).json({ success: true, conversations });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// GET all conversations for the logged-in buyer
const getBuyerConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({ buyer: req.user.id })
      .populate("owner",    "name email")
      .populate("property", "title location")
      .populate("messages.sender", "name role")
      .sort({ updatedAt: -1 });

    res.status(200).json({ success: true, conversations });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = { getOrCreateConversation, sendMessage, getOwnerConversations, getBuyerConversations };
