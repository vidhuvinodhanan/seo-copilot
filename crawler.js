const { chromium } = require("playwright");
const cheerio = require("cheerio");
const fs = require("fs");

const START_URL = "https://connectvidhu.com";
const MAX_PAGES = 10;

function normalize(url) {
  return url.replace(/\/$/, "");
}

async function crawlPage(page, url) {
  await page.goto(url, { waitUntil: "networkidle" });

  const html = await page.content();
  const $ = cheerio.load(html);

  return {
    url,
    title: $("title").text().trim(),
    metaDescription: $('meta[name="description"]').attr("content") || "",
    h1: $("h1").map((_, el) => $(el).text().trim()).get(),
    h2: $("h2").map((_, el) => $(el).text().trim()).get(),
    wordCount: $("body").text().split(/\s+/).length,
    images: $("img").map((_, el) => ({
      src: $(el).attr("src"),
      alt: $(el).attr("alt") || ""
    })).get(),
    internalLinks: $("a[href^='/']").map((_, el) => $(el).attr("href")).get()
  };
}

async function crawlSite(startUrl, maxPages = 5) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const visited = new Set();
  const results = [];
  const queue = [startUrl];

  while (queue.length && results.length < maxPages) {
    const currentUrl = normalize(queue.shift());
    if (visited.has(currentUrl)) continue;

    console.log(`🔍 Crawling: ${currentUrl}`);
    visited.add(currentUrl);

    const data = await crawlPage(page, currentUrl);
    results.push(data);

    data.internalLinks.forEach(link => {
      if (link.startsWith("/")) {
        queue.push(new URL(link, startUrl).href);
      }
    });
  }

  await browser.close();
  return results;
}

module.exports = crawlSite;

