import { runAI } from "./aiClient.js";

export async function validatePagePurpose(page) {
  const prompt = `
You are a senior Google Search Quality rater.

Analyze the page ONLY based on the data below.

Return STRICT JSON in this exact format:
{
  "pagePurpose": "...",
  "audience": "...",
  "confidenceScore": 0-100,
  "warning": "..." | null
}

PAGE DATA:
URL: ${page.url}
Title: ${page.title}
Meta Description: ${page.metaDescription}
H1: ${(page.headings?.h1 || []).join(" | ")}
H2: ${(page.headings?.h2 || []).join(" | ")}
Intro Text: ${page.introText}

Rules:
- One clear purpose only
- Confidence is how clear the purpose is
- Warning ONLY if intent is mixed or unclear
- No explanations
`;

  const result = await runAI(prompt);
  return JSON.parse(result);
}
