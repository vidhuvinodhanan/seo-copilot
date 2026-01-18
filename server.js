const MAX_PAGES = 5;
const express = require("express");
const cors = require("cors");
const path = require("path");

const crawlSite = require("./crawler");
const analyzePage = require("./rules");
const buildPrompt = require("./prompts");

const app = express();

app.use(cors());
app.use(express.json());

// ✅ SERVE FRONTEND (ADD THIS ONCE)
app.use(express.static(path.join(__dirname, "public")));

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
        prompt: buildPrompt(page, audit)
      };
    });

    res.json({
      status: "success",
      pages,
      audits,
      prompts
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 SEO Copilot API running on port ${PORT}`);
});

