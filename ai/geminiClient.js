const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function getGeminiModel() {
  return genAI.getGenerativeModel({
    model: "gemini-1.0-pro"
  });
}

module.exports = { getGeminiModel };
