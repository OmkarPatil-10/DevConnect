const { GoogleGenerativeAI } = require("@google/generative-ai");

// Singleton Gemini client
let embeddingModel;

function getEmbeddingModel() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error(
      "GEMINI_API_KEY is not set. Please add it to your .env file to enable AI matching."
    );
  }

  if (!embeddingModel) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    embeddingModel = genAI.getGenerativeModel({
      model: "gemini-embedding-001",
    });
  }

  return embeddingModel;
}

async function embedText(text) {
  const model = getEmbeddingModel();
  const result = await model.embedContent({
    content: { parts: [{ text }] },
  });
  return result.embedding.values;
}

module.exports = {
  embedText,
};


