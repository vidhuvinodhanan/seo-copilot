function analyzePage(page) {
  // HARD SAFETY GUARDS (critical)
  if (!page || typeof page !== "object") {
    return {
      url: "unknown",
      score: 0,
      issues: ["Invalid page data"]
    };
  }

  const issues = [];

  // SAFE NORMALIZATION
  const title = page.title || "";
  const metaDescription = page.metaDescription || "";
  const h1 = page.h1 || [];
  const wordCount = page.wordCount || 0;
  const images = page.images || [];
  const internalLinks = page.internalLinks || [];

  // Title
  if (title.length < 30 || title.length > 60) {
    issues.push("Title should be 30–60 characters");
  }

  // Meta description
  if (metaDescription.length < 120) {
    issues.push("Meta description is missing or too short");
  }

  // H1
  if (h1.length === 0) {
    issues.push("Missing H1 tag");
  }
  if (h1.length > 1) {
    issues.push("Multiple H1 tags detected");
  }

  // Content depth
  if (wordCount < 600) {
    issues.push("Thin content (less than 600 words)");
  }

  // Images alt text
  const missingAlt = images.filter(img => !img.alt).length;
  if (missingAlt > 0) {
    issues.push(`${missingAlt} images missing alt text`);
  }

  // Internal links
  if (internalLinks.length < 3) {
    issues.push("Too few internal links");
  }

  const score = Math.max(100 - issues.length * 10, 0);

  return {
    url: page.url,
    score,
    issues
  };
}

module.exports = analyzePage;
