const User     = require("../models/User");
const Property = require("../models/property");
const Conversation = require("../models/Conversation");

// GET platform statistics
const getStats = async (req, res) => {
  try {
    const [totalUsers, totalOwners, totalBuyers, totalAdmins, totalProperties, totalConversations] =
      await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: "owner" }),
        User.countDocuments({ role: "buyer" }),
        User.countDocuments({ role: "admin" }),
        Property.countDocuments(),
        Conversation.countDocuments(),
      ]);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalOwners,
        totalBuyers,
        totalAdmins,
        totalProperties,
        totalEnquiries: totalConversations,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// GET all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "name email role createdAt").sort({ createdAt: -1 });
    res.status(200).json({ success: true, users });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// GET all properties (for admin view)
const getAllPropertiesAdmin = async (req, res) => {
  try {
    const properties = await Property.find()
      .populate("owner", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, properties });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// DELETE any user (admin power)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.status(200).json({ success: true, message: "User deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// SETUP first admin — only works if no admin exists yet
const setupAdmin = async (req, res) => {
  try {
    const { email, setupSecret } = req.body;
    if (setupSecret !== process.env.ADMIN_SETUP_SECRET) {
      return res.status(403).json({ success: false, message: "Invalid setup secret" });
    }
    const adminExists = await User.findOne({ role: "admin" });
    if (adminExists) {
      return res.status(400).json({ success: false, message: "Admin already exists" });
    }
    const user = await User.findOneAndUpdate({ email }, { role: "admin" }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.status(200).json({ success: true, message: `${user.name} is now an admin` });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = { getStats, getAllUsers, getAllPropertiesAdmin, deleteUser, setupAdmin };
