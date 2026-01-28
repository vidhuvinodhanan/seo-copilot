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

// ------------------------------
// SEO issue impact explanations
// ------------------------------
const ISSUE_EXPLANATIONS = {
  "Thin content (less than 600 words)":
    "Google lacks enough context to understand and rank this page confidently.",

  "Missing H1 tag":
    "Search engines cannot clearly identify the main topic of this page.",

  "Meta description is missing or too short":
    "This reduces click-through rate from search results.",

  "Too few internal links":
    "Page authority is weak because internal link signals are limited.",

  "Title should be between 30–60 characters":
    "Titles outside this range are often truncated or underperform in search results.",

  "images missing alt text":
    "Images provide no semantic context, reducing accessibility and image SEO."
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
// 🎯 Helper: pick ONE priority issue per page
// ===============================
function getPriorityIssue(issues) {
  const critical = issues.find(i => classifyIssue(i) === "critical");
  if (critical) return critical;

  const important = issues.find(i => classifyIssue(i) === "important");
  if (important) return important;

  return issues[0];
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

    loading.classList.add("hidden");
    results.classList.remove("hidden");

    // ==================================================
    // 🛡️ DEFENSIVE SCORE CALCULATION (UI-SAFE)
    // ==================================================
    if (!data.audits || data.audits.length === 0) {
      overallScoreEl.textContent = "-";
      return;
    }

    const scores = data.audits
      .map(a => a.score)
      .filter(s => typeof s === "number");

    if (!scores.length) {
      overallScoreEl.textContent = "-";
      return;
    }

    const avgScore = Math.round(
      scores.reduce((a, b) => a + b, 0) / scores.length
    );

    overallScoreEl.textContent = `${avgScore} / 100`;

    // 🚨 Top Priority Fixes (site-wide)
    const topFixes = getTopPriorityFixes(data.audits);

    const priorityBox = document.createElement("div");
    priorityBox.className = "priority-fixes";

    priorityBox.innerHTML = `
      <h2>🚨 Fix These First (Highest SEO Impact)</h2>
      <ul>
        ${topFixes.map(([issue, count]) => `
          <li>
            <strong>${issue}</strong> (affects ${count} page${count > 1 ? "s" : ""})
            <div class="issue-impact">
              → ${ISSUE_EXPLANATIONS[issue] || "This issue negatively affects SEO performance."}
            </div>
          </li>
        `).join("")}
      </ul>
    `;

    results.prepend(priorityBox);

    // ------------------------------
    // Deduplicate pages by URL
    // ------------------------------
    const uniquePages = new Map();

    data.audits.forEach((audit, index) => {
      if (!uniquePages.has(audit.url)) {
        uniquePages.set(audit.url, {
          audit,
          prompt: data.prompts[index]?.prompt || ""
        });
      }
    });

    // ------------------------------
    // Render pages
    // ------------------------------
    uniquePages.forEach(({ audit, prompt }) => {
      const pageDiv = document.createElement("div");
      pageDiv.className = "page-report";

      pageDiv.innerHTML = `
        <h3>${audit.url}</h3>
        <p><strong>Score:</strong> ${audit.score}</p>

        ${audit.issues.length ? `
          <p class="priority-fix">
            <strong>Priority fix:</strong><br>
            → ${getPriorityIssue(audit.issues)}
          </p>
        ` : ""}

        <ul>
          ${audit.issues.map(issue => {
            const severity = classifyIssue(issue);
            const icon =
              severity === "critical" ? "🔴" :
              severity === "important" ? "🟡" :
              "🟢";
            return `<li>${icon} ${issue}</li>`;
          }).join("")}
        </ul>

        <details>
          <summary>View AI Analysis</summary>
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
