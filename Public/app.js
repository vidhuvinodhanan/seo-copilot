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

    // Calculate overall score
    const scores = data.audits.map(a => a.score);
    const avgScore = Math.round(
      scores.reduce((a, b) => a + b, 0) / scores.length
    );

    overallScoreEl.textContent = `${avgScore} / 100`;

    // Render each page report
    data.audits.forEach((audit, index) => {
      const prompt = data.prompts[index]?.prompt || "";

      const pageDiv = document.createElement("div");
      pageDiv.className = "page-report";

      pageDiv.innerHTML = `
        <h3>${audit.url}</h3>
        <p><strong>Score:</strong> ${audit.score}</p>

        <ul>
          ${audit.issues.map(issue => `<li>${issue}</li>`).join("")}
        </ul>

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
