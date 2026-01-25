const MAX_PAGES = 5;

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import crawlSite from "./crawler.js";
import analyzePage from "./rules.js";
import buildPrompt from "./prompts.js";
import { validatePagePurpose } from "./ai/pagePurposeValidator.js";

// Needed because __dirname does not exist in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

// ✅ Serve frontend
app.use(express.static(path.join(__dirname, "public")));

// ======================================================
// MAIN ANALYSIS ENDPOINT
// ======================================================
app.post("/analyze", async (req, res) => {
  try {
    const url = req.body?.url;

    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    // 1. Crawl
    const pages = await crawlSite(url, MAX_PAGES);

    // 2. Analyze
    const audits = pages.map(page => analyzePage(page));

    // 3. Build prompts
    const prompts = pages.map(page => {
      const audit = audits.find(a => a.url === page.url);
      return {
        url: page.url,
        prompt: buildPrompt(page, audit),
      };
    });

    res.json({
      status: "success",
      pages,
      audits,
      prompts,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ======================================================
// ✅ PAGE PURPOSE VALIDATOR ENDPOINT
// ======================================================
app.post("/page-purpose", async (req, res) => {
  try {
    const pageInput = req.body;

    if (!pageInput || !pageInput.url) {
      return res.status(400).json({ error: "Invalid page input" });
    }

    const result = await validatePagePurpose(pageInput);

    res.json({
      status: "success",
      result,
    });
  } catch (err) {
    console.error("Page purpose error:", err.message);
    res.status(500).json({ error: "Failed to analyze page purpose" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 SEO Copilot API running on port ${PORT}`);
});
