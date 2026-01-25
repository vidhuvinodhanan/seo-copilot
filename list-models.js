const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  const models = await genAI.listModels();
  models.models.forEach(m => {
    console.log(m.name, m.supportedGenerationMethods);
  });
}

listModels().catch(console.error);
