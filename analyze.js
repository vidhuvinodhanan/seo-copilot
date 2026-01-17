const fs = require("fs");
const analyzePage = require("./rules");

const siteData = JSON.parse(fs.readFileSync("site-data.json", "utf-8"));

const report = siteData.map(page => analyzePage(page));

fs.writeFileSync(
  "seo-report.json",
  JSON.stringify(report, null, 2),
  "utf-8"
);

console.log("✅ SEO analysis complete. Report saved to seo-report.json");
