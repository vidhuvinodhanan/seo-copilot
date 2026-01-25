// ===============================
// 🧠 SEO Severity Rules (Brain v2)
// ===============================
const ISSUE_SEVERITY = {
  "Missing H1 tag": "critical",
  "Multiple H1 tags detected": "critical",
  "Thin content (less than 600 words)": "critical",

  "Title should be between 30-60 characters": "important",
  "Meta description is missing or too short": "important",
  "Too few internal links": "important",

  "images missing alt text": "minor"
};

// ===============================
// 🔍 Helper: classify issue severity
// ===============================
function classifyIssue(issue) {
  for (const key in ISSUE_SEVERITY) {
    if (issue.includes(key)) {
      return ISSUE_SEVERITY[key];
    }
  }
  return "minor";
}

// ===============================
// 🗂 Helper: group issues by severity
// ===============================
function groupIssues(issues) {
  return issues.reduce(
    (acc, issue) => {
      const severity = classifyIssue(issue);
      acc[severity].push(issue);
      return acc;
    },
    { critical: [], important: [], minor: [] }
  );
}

// ===============================
// 🚨 Helper: aggregate top priority fixes
// ===============================
function getTopPriorityFixes(audits) {
  const issueCount = {};

  audits.forEach(audit => {
    audit.issues.forEach(issue => {
      const severity = classifyIssue(issue);
      if (severity === "critical" || severity === "important") {
        issueCount[issue] = (issueCount[issue] || 0) + 1;
      }
    });
  });

  return Object.entries(issueCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
}

// ===============================
// Existing App Logic
// ===============================
const analyzeBtn = document.getElementById("analyzeBtn");
const urlInput = document.getElementById("urlInput");
const loading = document.getElementById("loading");
const results = document.getElementById("results");
const overallScoreEl = document.getElementById("overallScore");
const pagesContainer = document.getElementById("pagesContainer");

analyzeBtn.addEventListener("click", async () => {
  const url = urlInput.value.trim();

  if (!url) {
    alert("Please enter a valid URL");
    return;
  }

  // Reset UI
  results.classList.add("hidden");
  pagesContainer.innerHTML = "";

  // ✅ FIX: remove old Top Priority Fixes box
  const oldPriority = results.querySelector(".priority-fixes");
  if (oldPriority) oldPriority.remove();

  loading.classList.remove("hidden");

  try {
    const response = await fetch("/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url })
    });

    const data = await response.json();

    // 🔁 Deduplicate pages by URL (frontend-safe)
    const seen = new Set();

    data.audits = data.audits.filter(audit => {
      if (seen.has(audit.url)) return false;
      seen.add(audit.url);
      return true;
    });

    data.prompts = data.prompts.filter(p => seen.has(p.url));

    loading.classList.add("hidden");
    results.classList.remove("hidden");

    // Calculate overall score
    const scores = data.audits.map(a => a.score);
    const avgScore = Math.round(
      scores.reduce((a, b) => a + b, 0) / scores.length
    );

    overallScoreEl.textContent = `${avgScore} / 100`;

    // 🚨 Render Top Priority Fixes
    const topFixes = getTopPriorityFixes(data.audits);

    const priorityBox = document.createElement("div");
    priorityBox.className = "priority-fixes";

    priorityBox.innerHTML = `
      <h2>🚨 Top Priority Fixes</h2>
      <ul>
        ${topFixes.map(
          ([issue, count]) =>
            `<li><strong>${issue}</strong> (affects ${count} page${count > 1 ? "s" : ""})</li>`
        ).join("")}
      </ul>
    `;

    results.prepend(priorityBox);

    // Render each page report
    data.audits.forEach((audit, index) => {
      const prompt = data.prompts[index]?.prompt || "";
      const grouped = groupIssues(audit.issues);

      const pageDiv = document.createElement("div");
      pageDiv.className = "page-report";

      pageDiv.innerHTML = `
        <h3>${audit.url}</h3>
        <p><strong>Score:</strong> ${audit.score}</p>

        ${grouped.critical.length ? `
          <div>
            <h4>🔴 Critical (Fix First)</h4>
            <ul>
              ${grouped.critical.map(i => `<li>${i}</li>`).join("")}
            </ul>
          </div>
        ` : ""}

        ${grouped.important.length ? `
          <div>
            <h4>🟡 Important</h4>
            <ul>
              ${grouped.important.map(i => `<li>${i}</li>`).join("")}
            </ul>
          </div>
        ` : ""}

        ${grouped.minor.length ? `
          <div>
            <h4>🟢 Minor</h4>
            <ul>
              ${grouped.minor.map(i => `<li>${i}</li>`).join("")}
            </ul>
          </div>
        ` : ""}

        <details>
          <summary>View AI Prompt</summary>
          <pre>${prompt}</pre>
        </details>
      `;

      pagesContainer.appendChild(pageDiv);
    });

  } catch (err) {
    loading.classList.add("hidden");
    alert("Error analyzing website. Check server logs.");
  }
});
