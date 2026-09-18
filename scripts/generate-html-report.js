const fs = require('fs');
const path = require('path');

const result = JSON.parse(fs.readFileSync('/tmp/loginwd-result.json', 'utf-8'));
const stats = result.stats;
const total = stats.expected + stats.unexpected + (stats.flaky || 0);
const passed = stats.expected;
const failed = stats.unexpected;
const flaky = stats.flaky || 0;
const skipped = stats.skipped || 0;
const duration = (stats.duration / 1000 / 60).toFixed(1);
const date = new Date().toLocaleString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });

const tests = [];
function processSuites(suites) {
  for (const suite of suites || []) {
    for (const spec of suite.specs || []) {
      for (const test of spec.tests || []) {
        const lastResult = test.results?.[test.results.length - 1];
        const status = lastResult?.status || 'skipped';
        const dur = ((lastResult?.duration || 0) / 1000).toFixed(1);
        tests.push({ suite: suite.title, title: spec.title, file: spec.file || 'auth/loginwd.specs.ts', line: test.line || 0, status, duration: dur + 's', projectName: test.projectName || 'chrome' });
      }
    }
    if (suite.suites) processSuites(suite.suites);
  }
}
processSuites(result.suites);
tests.sort((a, b) => { const order = { unexpected: 0, flaky: 1, expected: 2, skipped: 3 }; return order[a.status] - order[b.status]; });

let testRows = '';
tests.forEach(t => {
  const icon = t.status === 'expected' ? '&#10003;' : t.status === 'unexpected' ? '&#10007;' : t.status === 'flaky' ? '&#9888;' : '&#8856;';
  const statusClass = t.status === 'expected' ? 'passed' : t.status === 'unexpected' ? 'failed' : t.status === 'flaky' ? 'flaky' : 'skipped';
  testRows += '<div class="test-row" data-status="' + t.status + '">';
  testRows += '<div class="status-icon ' + statusClass + '">' + icon + '</div>';
  testRows += '<div class="test-info"><div class="test-title"><span class="suite">' + t.suite + ' &rsaquo; </span>' + t.title + '</div>';
  testRows += '<div class="test-meta"><span>' + t.file + ':' + t.line + '</span><span>&#9654;</span><a class="view-trace">&#8862; View Trace</a></div></div>';
  testRows += '<span class="project-badge">' + t.projectName + '</span>';
  testRows += '<div class="duration">' + t.duration + '</div></div>';
});

const html = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Playwright Test Report</title><style>* { margin: 0; padding: 0; box-sizing: border-box; } body { font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif; background: #f5f5f5; } .header { background: white; padding: 16px 24px; border-bottom: 1px solid #e0e0e0; display: flex; align-items: center; gap: 16px; flex-wrap: wrap; } .search { flex: 1; min-width: 200px; } .search input { width: 100%; padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; } .filters { display: flex; gap: 8px; align-items: center; } .filter-btn { padding: 6px 12px; border: 1px solid #ddd; border-radius: 6px; background: white; cursor: pointer; font-size: 13px; display: flex; align-items: center; gap: 6px; } .filter-btn:hover { background: #f0f0f0; } .filter-btn.active { background: #e3f2fd; border-color: #2196f3; } .filter-btn .count { background: #f0f0f0; padding: 2px 6px; border-radius: 10px; font-size: 11px; } .meta { background: white; padding: 12px 24px; border-bottom: 1px solid #e0e0e0; display: flex; justify-content: space-between; font-size: 13px; color: #666; } .file-section { background: white; margin: 16px; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); } .file-header { padding: 12px 16px; background: #f8f9fa; border-bottom: 1px solid #e0e0e0; font-weight: 500; font-size: 14px; } .test-row { padding: 12px 16px; border-bottom: 1px solid #f0f0f0; display: flex; align-items: center; gap: 12px; } .test-row:last-child { border-bottom: none; } .test-row:hover { background: #f8f9fa; } .status-icon { font-size: 16px; width: 20px; text-align: center; } .status-icon.failed { color: #f44336; } .status-icon.passed { color: #4caf50; } .status-icon.flaky { color: #ff9800; } .test-info { flex: 1; } .test-title { font-size: 14px; font-weight: 500; color: #333; } .test-title .suite { color: #666; font-weight: normal; } .test-meta { font-size: 12px; color: #999; margin-top: 4px; display: flex; align-items: center; gap: 8px; } .project-badge { padding: 2px 8px; background: #e3f2fd; color: #1976d2; border-radius: 12px; font-size: 11px; font-weight: 500; } .duration { font-size: 13px; color: #666; min-width: 60px; text-align: right; } .view-trace { font-size: 12px; color: #1976d2; cursor: pointer; text-decoration: none; } .view-trace:hover { text-decoration: underline; }</style></head><body><div class="header"><div class="search"><input type="text" placeholder="Search tests" id="searchInput"></div><div class="filters"><button class="filter-btn active" data-filter="all">All <span class="count">' + total + '</span></button><button class="filter-btn" data-filter="passed">&#10003; Passed <span class="count">' + passed + '</span></button><button class="filter-btn" data-filter="failed">&#10007; Failed <span class="count">' + failed + '</span></button><button class="filter-btn" data-filter="flaky">&#9888; Flaky <span class="count">' + flaky + '</span></button><button class="filter-btn" data-filter="skipped">Skipped <span class="count">' + skipped + '</span></button></div></div><div class="meta"><span>Project: chrome</span><span>' + date + ' &nbsp; Total time: ' + duration + 'm</span></div><div class="file-section"><div class="file-header">&#9660; auth/loginwd.specs.ts</div><div id="testList">' + testRows + '</div></div><script>document.querySelectorAll(".filter-btn").forEach(btn => { btn.addEventListener("click", () => { document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active")); btn.classList.add("active"); const filter = btn.dataset.filter; document.querySelectorAll(".test-row").forEach(row => { row.style.display = (filter === "all" || row.dataset.status === filter) ? "flex" : "none"; }); }); }); document.getElementById("searchInput").addEventListener("input", (e) => { const query = e.target.value.toLowerCase(); document.querySelectorAll(".test-row").forEach(row => { row.style.display = row.textContent.toLowerCase().includes(query) ? "flex" : "none"; }); });</script></body></html>';

const reportPath = path.join(__dirname, '..', 'playwright-report', 'custom-report.html');
fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, html);
console.log('HTML report generated:', reportPath);
