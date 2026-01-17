const fs = require("fs");
const buildPrompt = require("./prompts");

const pages = JSON.parse(fs.readFileSync("site-data.json", "utf-8"));
const audits = JSON.parse(fs.readFileSync("seo-report.json", "utf-8"));

const geminiInputs = pages.map(page => {
  const audit = audits.find(a => a.url === page.url);
  return {
    url: page.url,
    prompt: buildPrompt(page, audit)
  };
});

fs.writeFileSync(
  "gemini-inputs.json",
  JSON.stringify(geminiInputs, null, 2),
  "utf-8"
);

console.log("✅ Gemini strict prompts generated → gemini-inputs.json");
