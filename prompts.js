function buildStrictPrompt(page, audit) {
  return `
You are a senior Google Search Quality rater and SEO strategist.

URL:
${page.url}

PAGE DATA:
Title: ${page.title}
Meta Description: ${page.metaDescription}
H1: ${page.h1.join(" | ")}
H2s: ${page.h2.join(" | ")}
Word Count: ${page.wordCount}

SEO ISSUES FOUND:
${audit.issues.map(i => "- " + i).join("\n")}

TASK (STRICT MODE):
1. Explain clearly why this page will NOT rank on page 1.
2. Identify missing subtopics required for topical authority.
3. Specify exactly what new sections (H2/H3) must be added.
4. Rewrite the title & meta description for maximum CTR.
5. Warn about over-optimization or intent mismatch.

Rules:
- No generic advice
- No SEO clichés
- Be critical and specific
- Assume strong competition

Respond in bullet points.
`;
}

module.exports = buildStrictPrompt;
