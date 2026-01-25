import axios from "axios";
import * as cheerio from "cheerio";
import { URL } from "url";

export default async function crawlSite(startUrl, maxPages = 5) {
  const visited = new Set();
  const queue = [startUrl];
  const results = [];

  const base = new URL(startUrl).origin;

  // 🔁 Normalize URLs (remove trailing slash except root)
  function normalize(url) {
    return url.endsWith("/") && url.length > base.length
      ? url.slice(0, -1)
      : url;
  }

  while (queue.length && results.length < maxPages) {
    const currentUrl = normalize(queue.shift());
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
              const href = $(el).attr("href");
              const absolute = new URL(href, base).href;
              return normalize(absolute.split("#")[0]); // 🔥 HASH + SLASH CLEAN
            } catch {
              return null;
            }
          })
          .get()
          .filter(href => href && href.startsWith(base))
      };

      results.push(page);

      // ✅ Queue deduplicated URLs only
      page.internalLinks.forEach(link => {
        if (!visited.has(link)) queue.push(link);
      });

    } catch (err) {
      console.error("Crawl failed:", currentUrl, err.message);
    }
  }

  return results;
}
