const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// ======================================================
// CONFIGURATION
// ======================================================

const ROOT_DIR = __dirname;
const WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
const CHANNEL = process.env.SLACK_CHANNEL || '#reny-report';
const QC_NAME = process.env.QC_NAME || 'Reny';
const REPORT_URL =
  process.env.REPORT_URL ||
  'https://rhenot.github.io/report-playwright/custom-report.html';

const JSON_REPORT = path.join(ROOT_DIR, 'test-results', 'playwright-report.json');
const CUSTOM_REPORT = path.join(ROOT_DIR, 'custom-report.html');
const GH_PAGES_BRANCH = 'gh-pages';


// ======================================================
// HELPER - RUN COMMAND
// ======================================================

function runCommand(command) {
  console.log('');
  console.log('================================================');
  console.log(`▶ ${command}`);
  console.log('================================================');
  console.log('');
  try {
    execSync(command, { cwd: ROOT_DIR, stdio: 'inherit' });
    return true;
  } catch (error) {
    console.log('');
    console.log('⚠️ Playwright selesai dengan test failure.');
    console.log('➡️ Report tetap akan dibuat dan dikirim ke Slack.');
    return false;
  }
}


// ======================================================
// BUILD PLAYWRIGHT COMMAND
// ======================================================

function buildPlaywrightCommand() {
  const args = process.argv.slice(2);
  let command = 'npx playwright test';
  if (args.length > 0) {
    command += ' ' + args.map(arg => `"${arg.replace(/"/g, '\\"')}"`).join(' ');
  }
  return command;
}


// ======================================================
// READ JSON REPORT
// ======================================================

function readJsonReport() {
  if (!fs.existsSync(JSON_REPORT)) {
    console.log('');
    console.log('⚠️ JSON report tidak ditemukan:', JSON_REPORT);
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(JSON_REPORT, 'utf8'));
  } catch (error) {
    console.error('❌ Gagal membaca JSON report:', error.message);
    return null;
  }
}


// ======================================================
// STATISTICS
// ======================================================

function getStatistics(report) {
  if (!report) return { total: 0, passed: 0, failed: 0, skipped: 0, flaky: 0, passRate: '0.0', duration: '0.0' };
  const stats = report.stats || {};
  const passed = Number(stats.expected || 0);
  const failed = Number(stats.unexpected || 0);
  const skipped = Number(stats.skipped || 0);
  const flaky = Number(stats.flaky || 0);
  const total = passed + failed + skipped;
  const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : '0.0';
  const duration = stats.duration ? (stats.duration / 1000 / 60).toFixed(1) : '0.0';
  return { total, passed, failed, skipped, flaky, passRate, duration };
}


// ======================================================
// FAILED TESTS
// ======================================================

function getFailedTests(report) {
  const failedTests = [];
  const flakyTests = [];
  if (!report) return { failedTests, flakyTests };
  for (const suite of report.suites || []) {
    for (const spec of suite.specs || []) {
      for (const test of spec.tests || []) {
        const results = test.results || [];
        if (results.length === 0) continue;
        const lastResult = results[results.length - 1];
        if (lastResult?.status === 'unexpected') {
          const passedOnRetry = results.some((r, i) => i > 0 && r.status === 'passed');
          if (passedOnRetry) {
            flakyTests.push(spec.title);
          } else {
            failedTests.push({
              title: spec.title,
              error: lastResult.error?.message || 'Unknown error',
              duration: lastResult.duration ? (lastResult.duration / 1000).toFixed(1) + 's' : 'N/A'
            });
          }
        }
      }
    }
  }
  return { failedTests, flakyTests };
}


// ======================================================
// STATUS
// ======================================================

function getStatus(stats) {
  if (stats.failed > 0) return { emoji: '🔴', text: 'TEST FAILED', color: '#E01E5A' };
  if (stats.flaky > 0) return { emoji: '🟡', text: 'PASSED WITH FLAKY', color: '#FFA500' };
  return { emoji: '', text: 'ALL TESTS PASSED', color: '#36A64F' };
}


// ======================================================
// DEPLOY TO GH-PAGES
// ======================================================

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      if (!fs.existsSync(destPath)) fs.mkdirSync(destPath, { recursive: true });
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function deployToGhPages() {
  if (!fs.existsSync(CUSTOM_REPORT)) {
    console.log('⚠️ custom-report.html tidak ditemukan, skip deploy.');
    return false;
  }
  console.log('');
  console.log('🚀 Deploying reports to gh-pages...');
  try {
    const currentBranch = execSync('git branch --show-current', { cwd: ROOT_DIR }).toString().trim();

    // Save to temp BEFORE branch switch (avoid copy-to-self on gh-pages)
    const tempReport = path.join(ROOT_DIR, '.tmp-custom-report.html');
    fs.copyFileSync(CUSTOM_REPORT, tempReport);

    const tempPwDir = path.join(ROOT_DIR, '.tmp-playwright-report');
    const srcPw = path.join(ROOT_DIR, 'playwright-report');
    if (fs.existsSync(srcPw)) {
      if (fs.existsSync(tempPwDir)) fs.rmSync(tempPwDir, { recursive: true, force: true });
      fs.mkdirSync(tempPwDir, { recursive: true });
      copyDirRecursive(srcPw, tempPwDir);
    }

    execSync('git stash push -m "auto-stash deploy"', { cwd: ROOT_DIR });
    execSync('git checkout gh-pages', { cwd: ROOT_DIR });

    // Remove old report files
    try { fs.unlinkSync(path.join(ROOT_DIR, 'custom-report.html')); } catch(e) {}
    const dp = path.join(ROOT_DIR, 'playwright-report');
    if (fs.existsSync(dp)) fs.rmSync(dp, { recursive: true, force: true });

    // Copy from temp
    fs.copyFileSync(tempReport, path.join(ROOT_DIR, 'custom-report.html'));
    if (fs.existsSync(tempPwDir)) {
      fs.mkdirSync(path.join(ROOT_DIR, 'playwright-report'), { recursive: true });
      copyDirRecursive(tempPwDir, path.join(ROOT_DIR, 'playwright-report'));
    }

    // Clean temp
    fs.unlinkSync(tempReport);
    if (fs.existsSync(tempPwDir)) fs.rmSync(tempPwDir, { recursive: true, force: true });

    execSync('git add -A', { cwd: ROOT_DIR });
    execSync('git commit -m "Update reports [auto]" --allow-empty', { cwd: ROOT_DIR });
    execSync('git push origin gh-pages', { cwd: ROOT_DIR });
    execSync(`git checkout ${currentBranch}`, { cwd: ROOT_DIR });
    execSync('git stash pop', { cwd: ROOT_DIR });

    console.log('✅ Reports deployed to gh-pages!');
    console.log(` ${REPORT_URL}`);
    return true;
  } catch (error) {
    console.error('❌ Gagal deploy ke gh-pages:', error.message);
    try { fs.unlinkSync(path.join(ROOT_DIR, '.tmp-custom-report.html')); } catch(e) {}
    try { fs.rmSync(path.join(ROOT_DIR, '.tmp-playwright-report'), { recursive: true, force: true }); } catch(e) {}
    try {
      const cur = execSync('git branch --show-current', { cwd: ROOT_DIR }).toString().trim();
      if (cur !== 'main') execSync('git checkout main', { cwd: ROOT_DIR });
      execSync('git stash pop', { cwd: ROOT_DIR });
    } catch(_) {}
    return false;
  }
}


// ======================================================
// BUILD SLACK PAYLOAD
// ======================================================

function buildSlackPayload(stats, failedTests, flakyTests) {
  const status = getStatus(stats);
  const dateStr = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });

  const attachments = [{
    color: status.color,
    title: `${status.emoji} RCTI+ Web Automation Report`,
    title_link: REPORT_URL,
    text: `*${status.text}*\nAutomated test execution completed successfully.`,
    fields: [
      { title: ' QC By', value: QC_NAME, short: true },
      { title: '📊 Total Tests', value: `${stats.total}`, short: true },
      { title: '✅ Passed', value: `${stats.passed}`, short: true },
      { title: '❌ Failed', value: `${stats.failed}`, short: true },
      { title: ' Flaky', value: `${stats.flaky}`, short: true },
      { title: '⏭ Skipped', value: `${stats.skipped}`, short: true },
      { title: '📈 Pass Rate', value: `${stats.passRate}%`, short: true },
      { title: '⏱ Duration', value: `${stats.duration} min`, short: true },
      { title: '🌐 Report', value: 'Custom Playwright Report', short: true },
      { title: '📅 Execution', value: dateStr, short: true }
    ]
  }];

  // Failed tests
  if (failedTests.length > 0) {
    const failedText = failedTests.map((test, i) => {
      let error = test.error || '';
      if (error.length > 150) error = error.substring(0, 150) + '...';
      return `*${i + 1}. ${test.title}*\n⏱ ${test.duration}\n❌ ${error}`;
    }).join('\n\n');
    attachments.push({ color: '#E01E5A', title: '❌ Failed Tests Analysis', text: failedText });
  }

  // Flaky tests
  if (flakyTests.length > 0) {
    const flakyText = flakyTests.map((t, i) => `${i + 1}. ${t}`).join('\n');
    attachments.push({ color: '#FFA500', title: '🟡 Flaky Tests', text: `${flakyText}\n\n_Passed after retry._` });
  }

  // Report link
  attachments.push({
    color: '#439FE0',
    title: '📊 Open Full Custom Report',
    title_link: REPORT_URL,
    text: `<${REPORT_URL}|🔗 Click here to open the interactive Playwright report>`
  });

  return {
    channel: CHANNEL,
    username: 'Playwright Test Bot',
    icon_emoji: ':robot_face:',
    attachments
  };
}


// ======================================================
// SEND TO SLACK
// ======================================================

async function sendToSlack(payload) {
  if (!WEBHOOK_URL) {
    console.log('⚠️ SLACK_WEBHOOK_URL belum tersedia. Tambahkan ke file .env');
    return false;
  }
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (response.ok) {
      console.log('');
      console.log('================================================');
      console.log('       ✅ REPORT SENT TO SLACK');
      console.log('================================================');
      return true;
    }
    const errorText = await response.text();
    console.error('❌ Slack error:', response.status, errorText);
    return false;
  } catch (error) {
    console.error('❌ Error sending report to Slack:', error.message);
    return false;
  }
}


// ======================================================
// MAIN
// ======================================================

async function main() {
  console.log('');
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║        RCTI+ PLAYWRIGHT AUTOMATION          ║');
  console.log('║              TEST + REPORT + SLACK          ║');
  console.log('╚══════════════════════════════════════════════╝');
  console.log('');

  // STEP 1 — Run tests
  console.log('🧪 STEP 1 — Running Playwright tests');
  const playwrightCommand = buildPlaywrightCommand();
  console.log('');
  console.log(`▶ ${playwrightCommand}`);
  const testSuccess = runCommand(playwrightCommand);

  // STEP 2 — Generate custom report
  console.log('');
  console.log('📊 STEP 2 — Generating custom report');
  const generatorPath = path.join(ROOT_DIR, 'generate-custom-report.js');
  if (!fs.existsSync(generatorPath)) {
    console.error('❌ generate-custom-report.js tidak ditemukan!');
    process.exit(1);
  }
  runCommand('node generate-custom-report.js');

  // STEP 2.5 — Deploy to gh-pages
  deployToGhPages();

  // STEP 3 — Read results
  console.log('');
  console.log('📖 STEP 3 — Reading test results');
  const report = readJsonReport();
  const stats = getStatistics(report);
  const testDetails = getFailedTests(report);

  // STEP 4 — Send to Slack
  console.log('');
  console.log('📤 STEP 4 — Sending report to Slack');
  const payload = buildSlackPayload(stats, testDetails.failedTests, testDetails.flakyTests);
  await sendToSlack(payload);

  // SUMMARY
  console.log('');
  console.log('================================================');
  console.log('                 TEST SUMMARY');
  console.log('================================================');
  console.log('');
  console.log(`📊 Total   : ${stats.total}`);
  console.log(`✅ Passed  : ${stats.passed}`);
  console.log(`❌ Failed  : ${stats.failed}`);
  console.log(`🟡 Flaky   : ${stats.flaky}`);
  console.log(` Skipped  : ${stats.skipped}`);
  console.log(`📈 Pass    : ${stats.passRate}%`);
  console.log(` Duration : ${stats.duration} min`);
  console.log('');
  console.log(` Report  : ${REPORT_URL}`);
  console.log('');
  console.log('================================================');

  if (!testSuccess) process.exit(1);
}

main().catch(error => {
  console.error('');
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
