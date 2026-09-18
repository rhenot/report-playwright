const { execSync, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');

// Load .env
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#][^=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    let value = match[2].trim();
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    process.env[key] = value;
  }
});

const TEST_FILE = process.argv[2] || 'tests/Homepage/Homepagewd.specs.ts';
const PROJECT = process.argv[3] || 'chrome';
const QC_NAME = process.env.QC_NAME || 'Reny';

async function runTests() {
  console.log(' Running tests...\n');
  try {
    execSync(`npx playwright test ${TEST_FILE} --project=${PROJECT} --reporter=json 2>/dev/null > /tmp/test-result.json`, {
      stdio: 'pipe'
    });
    console.log('✅ Tests completed\n');
  } catch (error) {
    console.log('⚠️  Tests completed with failures\n');
  }
}

function generateHTMLReport() {
  console.log('📊 Generating HTML report...\n');
  const result = JSON.parse(fs.readFileSync('/tmp/test-result.json', 'utf-8'));
  const stats = result.stats;
  const total = stats.expected + stats.unexpected + (stats.flaky || 0);
  const passed = stats.expected;
  const failed = stats.unexpected;
  const flaky = stats.flaky || 0;
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
          tests.push({ suite: suite.title, title: spec.title, file: spec.file || TEST_FILE, line: test.line || 0, status, duration: dur + 's', projectName: test.projectName || PROJECT });
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

  const html = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Playwright Test Report</title><style>* { margin: 0; padding: 0; box-sizing: border-box; } body { font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif; background: #f5f5f5; } .header { background: white; padding: 16px 24px; border-bottom: 1px solid #e0e0e0; display: flex; align-items: center; gap: 16px; flex-wrap: wrap; } .search { flex: 1; min-width: 200px; } .search input { width: 100%; padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; } .filters { display: flex; gap: 8px; align-items: center; } .filter-btn { padding: 6px 12px; border: 1px solid #ddd; border-radius: 6px; background: white; cursor: pointer; font-size: 13px; display: flex; align-items: center; gap: 6px; } .filter-btn:hover { background: #f0f0f0; } .filter-btn.active { background: #e3f2fd; border-color: #2196f3; } .filter-btn .count { background: #f0f0f0; padding: 2px 6px; border-radius: 10px; font-size: 11px; } .meta { background: white; padding: 12px 24px; border-bottom: 1px solid #e0e0e0; display: flex; justify-content: space-between; font-size: 13px; color: #666; } .file-section { background: white; margin: 16px; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); } .file-header { padding: 12px 16px; background: #f8f9fa; border-bottom: 1px solid #e0e0e0; font-weight: 500; font-size: 14px; } .test-row { padding: 12px 16px; border-bottom: 1px solid #f0f0f0; display: flex; align-items: center; gap: 12px; } .test-row:last-child { border-bottom: none; } .test-row:hover { background: #f8f9fa; } .status-icon { font-size: 16px; width: 20px; text-align: center; } .status-icon.failed { color: #f44336; } .status-icon.passed { color: #4caf50; } .status-icon.flaky { color: #ff9800; } .test-info { flex: 1; } .test-title { font-size: 14px; font-weight: 500; color: #333; } .test-title .suite { color: #666; font-weight: normal; } .test-meta { font-size: 12px; color: #999; margin-top: 4px; display: flex; align-items: center; gap: 8px; } .project-badge { padding: 2px 8px; background: #e3f2fd; color: #1976d2; border-radius: 12px; font-size: 11px; font-weight: 500; } .duration { font-size: 13px; color: #666; min-width: 60px; text-align: right; } .view-trace { font-size: 12px; color: #1976d2; cursor: pointer; text-decoration: none; } .view-trace:hover { text-decoration: underline; }</style></head><body><div class="header"><div class="search"><input type="text" placeholder="Search tests" id="searchInput"></div><div class="filters"><button class="filter-btn active" data-filter="all">All <span class="count">' + total + '</span></button><button class="filter-btn" data-filter="passed">&#10003; Passed <span class="count">' + passed + '</span></button><button class="filter-btn" data-filter="failed">&#10007; Failed <span class="count">' + failed + '</span></button><button class="filter-btn" data-filter="flaky">&#9888; Flaky <span class="count">' + flaky + '</span></button></div></div><div class="meta"><span>Project: ' + PROJECT + '</span><span>' + date + ' &nbsp; Total time: ' + duration + 'm</span></div><div class="file-section"><div class="file-header">&#9660; ' + TEST_FILE + '</div><div id="testList">' + testRows + '</div></div><script>document.querySelectorAll(".filter-btn").forEach(btn => { btn.addEventListener("click", () => { document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active")); btn.classList.add("active"); const filter = btn.dataset.filter; document.querySelectorAll(".test-row").forEach(row => { row.style.display = (filter === "all" || row.dataset.status === filter) ? "flex" : "none"; }); }); }); document.getElementById("searchInput").addEventListener("input", (e) => { const query = e.target.value.toLowerCase(); document.querySelectorAll(".test-row").forEach(row => { row.style.display = row.textContent.toLowerCase().includes(query) ? "flex" : "none"; }); });</script></body></html>';

  const reportPath = path.join(__dirname, '..', 'playwright-report', 'custom-report.html');
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, html);
  console.log('✅ HTML report generated\n');
  return { total, passed, failed, flaky, duration, date };
}

async function startReportServer() {
  console.log(' Starting report server...\n');
  exec('npx playwright show-report --port=9323');
  await new Promise(resolve => setTimeout(resolve, 3000));
  console.log('✅ Report server running on port 9323\n');
}

async function createPublicTunnel() {
  console.log('📡 Creating public tunnel...\n');
  const lt = require('localtunnel');
  const tunnel = await lt({ port: 9323 });
  console.log('✅ Public URL: ' + tunnel.url + '\n');
  return tunnel;
}

async function sendToSlack(publicUrl, stats) {
  console.log(' Sending report to Slack...\n');
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    console.error('❌ SLACK_WEBHOOK_URL not found in .env');
    return;
  }

  const emoji = stats.failed === 0 ? '✅' : '⚠️';
  const message = {
    text: emoji + ' *Playwright Test Report - ' + QC_NAME + '*\n\n' +
      '*QC:* ' + QC_NAME + '\n' +
      '*Total Tests:* ' + stats.total + '\n' +
      '*Passed:* ' + stats.passed + ' ✅\n' +
      '*Failed:* ' + stats.failed + ' \n' +
      '*Flaky:* ' + stats.flaky + ' ⚠️\n' +
      '*Pass Rate:* ' + ((stats.passed / stats.total) * 100).toFixed(1) + '%\n' +
      '*Duration:* ' + stats.duration + ' min\n\n' +
      '📊 *View Interactive Report:*\n' + publicUrl + '\n\n' +
      '_Link active while tunnel is running (max 1 hour)_',
    attachments: [{
      color: stats.failed === 0 ? '#36a64f' : '#e01e5a',
      title: '🔗 Click to view HTML Report',
      title_link: publicUrl,
      fields: [
        { title: 'QC', value: QC_NAME, short: true },
        { title: 'Project', value: PROJECT, short: true },
        { title: 'Pass Rate', value: ((stats.passed / stats.total) * 100).toFixed(1) + '%', short: true },
        { title: 'Duration', value: stats.duration + ' min', short: true },
      ],
    }],
  };

  const url = new URL(webhookUrl);
  const data = JSON.stringify(message);
  const options = {
    hostname: url.hostname,
    path: url.pathname + url.search,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) },
    timeout: 10000
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let response = '';
      res.on('data', (chunk) => { response += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log('✅ Report sent to Slack!\n');
          resolve();
        } else {
          reject(new Error('Slack error: ' + res.statusCode));
        }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
    req.write(data);
    req.end();
  });
}

async function main() {
  try {
    await runTests();
    const stats = generateHTMLReport();
    await startReportServer();
    const tunnel = await createPublicTunnel();
    await sendToSlack(tunnel.url, stats);
    
    console.log('🔗 Public URL: ' + tunnel.url);
    console.log('⚠️  Keep this terminal open to maintain the tunnel.');
    console.log('   Tunnel will auto-close after 1 hour.\n');
    
    setTimeout(() => {
      console.log('⏰ Tunnel closed after 1 hour.');
      tunnel.close();
      process.exit(0);
    }, 3600000);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
