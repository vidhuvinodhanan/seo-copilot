function buildPrompt(page, audit) {
  const h1s = Array.isArray(page.h1)
    ? page.h1
    : page.h1
      ? [page.h1]
      : [];

  const title = page.title || "Missing title";
  const meta = page.metaDescription || "Missing meta description";
  const content = page.text || "";

  return `
URL: ${page.url}

Title: ${title}
Meta Description: ${meta}
H1s: ${h1s.join(", ") || "No H1 found"}

Issues:
${audit.issues.join("\n")}

Suggest SEO improvements clearly and practically.
`;
}

module.exports = buildPrompt;
