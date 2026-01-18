function buildPrompt(page, audit) {
  return `
URL: ${page.url}
SEO Score: ${audit.score}/100

Issues:
${audit.issues.map(i => `- ${i}`).join("\n")}

Provide clear, actionable SEO improvements.
`;
}

module.exports = buildPrompt;
