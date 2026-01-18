const axios = require("axios");
const cheerio = require("cheerio");
const { URL } = require("url");

async function crawlSite(startUrl, maxPages = 5) {
  const visited = new Set();
  const queue = [startUrl];
  const results = [];

  const base = new URL(startUrl).origin;

  while (queue.length && results.length < maxPages) {
    const currentUrl = queue.shift();
    if (visited.has(currentUrl)) continue;
    visited.add(currentUrl);

    try {
      const { data: html } = await axios.get(currentUrl, { timeout: 10000 });
      const $ = cheerio.load(html);

      const page = {
        url: currentUrl,
        title: $("title").text().trim(),
        metaDescription:
          $('meta[name="description"]').attr("content")?.trim() || "",
        h1: $("h1")
          .map((_, el) => $(el).text().trim())
          .get(),
        wordCount: $("body")
          .text()
          .replace(/\s+/g, " ")
          .trim()
          .split(" ").length,
        images: $("img")
          .map((_, el) => ({
            alt: $(el).attr("alt") || ""
          }))
          .get(),
        internalLinks: $("a[href]")
          .map((_, el) => {
            try {
              return new URL($(el).attr("href"), base).href;
            } catch {
              return null;
            }
          })
          .get()
          .filter(href => href && href.startsWith(base))
      };

      results.push(page);

      page.internalLinks.forEach(link => {
        if (!visited.has(link)) queue.push(link);
      });

    } catch (err) {
      console.error("Crawl failed:", currentUrl, err.message);
    }
  }

  return results;
}

module.exports = crawlSite;
