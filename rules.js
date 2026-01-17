function analyzePage(page) {
  const issues = [];

  // Title
  if (!page.title || page.title.length < 30 || page.title.length > 60) {
    issues.push("Title should be 30–60 characters");
  }

  // Meta description
  if (!page.metaDescription || page.metaDescription.length < 120) {
    issues.push("Meta description is missing or too short");
  }

  // H1
  if (!page.h1 || page.h1.length === 0) {
    issues.push("Missing H1 tag");
  }
  if (page.h1 && page.h1.length > 1) {
    issues.push("Multiple H1 tags detected");
  }

  // Content depth
  if (page.wordCount < 600) {
    issues.push("Thin content (less than 600 words)");
  }

  // Images alt text
  const missingAlt = page.images.filter(img => !img.alt).length;
  if (missingAlt > 0) {
    issues.push(`${missingAlt} images missing alt text`);
  }

  // Internal links
  if (page.internalLinks.length < 3) {
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
