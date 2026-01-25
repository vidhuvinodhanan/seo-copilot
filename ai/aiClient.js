import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is missing");
}

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function runAI(prompt) {
  const response = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a senior SEO strategist and Google Search Quality evaluator. Be precise, critical, and structured.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.2,
  });

  return response.choices[0].message.content.trim();
}
