function analyzePage(page) {
  const issues = [];

  const title = page.title || "";
  const meta = page.metaDescription || "";
  const h1 = Array.isArray(page.h1) ? page.h1 : [];
  const wordCount = page.wordCount || 0;
  const images = page.images || [];
  const internalLinks = page.internalLinks || [];

  if (title.length < 30 || title.length > 60) {
    issues.push("Title should be between 30–60 characters");
  }

  if (meta.length < 120) {
    issues.push("Meta description is missing or too short");
  }

  if (h1.length === 0) {
    issues.push("Missing H1 tag");
  }

  if (h1.length > 1) {
    issues.push("Multiple H1 tags detected");
  }

  if (wordCount < 600) {
    issues.push("Thin content (less than 600 words)");
  }

  const missingAlt = images.filter(img => !img.alt).length;
  if (missingAlt > 0) {
    issues.push(`${missingAlt} images missing alt text`);
  }

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
