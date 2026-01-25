const { getGeminiModel } = require("./geminiClient");
const pagePurposePrompt = require("./pagePurposePrompt");

async function validatePagePurpose(pageInput) {
  const model = getGeminiModel();

  const prompt = `
${pagePurposePrompt}

PAGE DATA:
${JSON.stringify(pageInput, null, 2)}
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  try {
    return JSON.parse(text);
  } catch (err) {
    return {
      pagePurpose: null,
      intendedAudience: null,
      confidenceScore: 0,
      warning: "Invalid JSON returned by Gemini"
    };
  }
}

module.exports = validatePagePurpose;
