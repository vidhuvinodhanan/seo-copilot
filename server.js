const MAX_PAGES = 5;
const express = require("express");
const cors = require("cors");

const crawlSite = require("./crawler"); // we’ll export this next
const analyzePage = require("./rules");
const buildPrompt = require("./prompts");

const app = express();
app.use(cors());
app.use(express.json());

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

    // 3. Build Gemini prompts
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

app.listen(PORT, () => {
  console.log(`🚀 SEO Copilot API running on http://localhost:${PORT}`);
});
