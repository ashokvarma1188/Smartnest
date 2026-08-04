const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY_CHARTBOT);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const SYSTEM_PROMPT = `You are SmartNest AI Assistant — a helpful chatbot for SmartNest, a real estate platform that connects property owners and buyers directly without any broker or commission.

SmartNest features:
- Buyers can browse, search, and filter properties by location, price, and bedrooms
- Owners can list properties with up to 8 images
- Users can register as Owner or Buyer
- Login with email/password or Google account
- OTP-based password reset via email
- Each property shows full details, image gallery, and contact option

Your job:
- Help buyers find properties based on their needs
- Explain how SmartNest works
- Answer real estate questions simply
- Guide users on how to use the platform

Rules:
- Keep answers short (2-4 lines max)
- Be friendly and helpful
- If asked something unrelated to real estate or SmartNest, politely redirect
- Do not make up specific property listings — tell users to use the search and filter`;

const chat = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }

    const result = await model.generateContent(`${SYSTEM_PROMPT}\n\nUser: ${message}\nAssistant:`);
    const reply = result.response.text();

    res.status(200).json({ success: true, reply });

  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "AI service error. Please try again." });
  }
};

module.exports = { chat };
