const axios = require("axios");
const cheerio = require("cheerio");
const { URL } = require("url");

async function crawlSite(startUrl, maxPages = 5) {
  const visited = new Set();
  const queue = [startUrl];
  const results = [];

  const base = new URL(startUrl).origin;

  while (queue.length && results.length < maxPages) {
    const url = queue.shift();
    if (visited.has(url)) continue;
    visited.add(url);

    try {
      const { data: html } = await axios.get(url, { timeout: 10000 });
      const $ = cheerio.load(html);

      const page = {
        url,
        title: $("title").text() || "",
        metaDescription: $('meta[name="description"]').attr("content") || "",
        h1: $("h1").first().text() || "",
        text: $("body").text().replace(/\s+/g, " ").trim(),
      };

      results.push(page);

      $("a[href]").each((_, el) => {
        const href = $(el).attr("href");
        if (!href) return;

        try {
          const next = new URL(href, base).href;
          if (next.startsWith(base) && !visited.has(next)) {
            queue.push(next);
          }
        } catch {}
      });

    } catch (err) {
      console.error("Crawl failed:", url, err.message);
    }
  }

  return results;
}

module.exports = crawlSite;
