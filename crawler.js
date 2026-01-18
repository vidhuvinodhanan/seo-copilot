const axios = require("axios");
const cheerio = require("cheerio");
const { URL } = require("url");

/**
 * Normalize URLs to avoid duplicates
 */
function normalizeUrl(rawUrl) {
  try {
    const url = new URL(rawUrl);
    url.hash = "";

    if (url.pathname !== "/" && url.pathname.endsWith("/")) {
      url.pathname = url.pathname.slice(0, -1);
    }

    return url.toString();
  } catch {
    return null;
  }
}

async function crawlSite(startUrl, maxPages = 5) {
  const start = normalizeUrl(startUrl);
  if (!start) throw new Error("Invalid start URL");

  const baseOrigin = new URL(start).origin;

  const visited = new Set();
  const queue = [start];
  const pages = [];

  while (queue.length && pages.length < maxPages) {
    const currentUrl = queue.shift();
    if (visited.has(currentUrl)) continue;
    visited.add(currentUrl);

    try {
      const { data: html } = await axios.get(currentUrl, {
        timeout: 10000,
        headers: { "User-Agent": "SEO-Copilot/1.0" }
      });

      const $ = cheerio.load(html);

      const images = [];
      $("img").each((_, img) => {
        images.push({
          src: $(img).attr("src") || "",
          alt: $(img).attr("alt") || ""
        });
      });

      const internalLinks = [];
      $("a[href]").each((_, el) => {
        const href = $(el).attr("href");
        if (!href) return;

        try {
          const resolved = normalizeUrl(new URL(href, currentUrl).href);
          if (resolved && resolved.startsWith(baseOrigin)) {
            internalLinks.push(resolved);
            if (!visited.has(resolved)) queue.push(resolved);
          }
        } catch {}
      });

      const bodyText = $("body")
        .clone()
        .find("script, style, noscript, iframe")
        .remove()
        .end()
        .text()
        .replace(/\s+/g, " ")
        .trim();

      pages.push({
        url: currentUrl,
        title: $("title").text().trim(),
        metaDescription: $('meta[name="description"]').attr("content") || "",
        h1: $("h1").map((_, h) => $(h).text().trim()).get(),
        images,
        internalLinks,
        text: bodyText,
        wordCount: bodyText.split(" ").length
      });

    } catch (err) {
      console.error("Crawl failed:", currentUrl, err.message);
    }
  }

  return pages;
}

module.exports = crawlSite;
