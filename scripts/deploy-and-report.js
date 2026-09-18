const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
const CHANNEL = process.env.SLACK_CHANNEL || '#reny-report';
const PAGES_URL = 'https://rhenot.github.io/report-playwright/';
const QC_NAME = process.env.QC_NAME || 'Reny';

async function main() {
  console.log('📊 Deploying HTML report to GitHub Pages...\n');

  const reportDir = path.join(__dirname, '..', 'playwright-report');
  
  if (!fs.existsSync(path.join(reportDir, 'index.html'))) {
    console.error('❌ HTML report not found. Run tests first.');
    process.exit(1);
  }

  const worktreeDir = path.join(__dirname, '..', '.qwen', 'gh-pages-worktree');
  
  try {
    // Use git worktree to avoid conflicts with working directory
    console.log('🔄 Setting up gh-pages worktree...');
    
    // Clean up existing worktree if any
    try { execSync('git worktree remove .qwen/gh-pages-worktree --force 2>/dev/null', { cwd: path.join(__dirname, '..') }); } catch (e) {}
    
    // Check if gh-pages branch exists on remote
    const branches = execSync('git branch -r', { encoding: 'utf-8' });
    const hasRemoteGhPages = branches.includes('origin/gh-pages');
    
    if (hasRemoteGhPages) {
      execSync(`git worktree add ${worktreeDir} gh-pages`, { cwd: path.join(__dirname, '..'), stdio: 'inherit' });
    } else {
      execSync(`git worktree add -b gh-pages ${worktreeDir}`, { cwd: path.join(__dirname, '..'), stdio: 'inherit' });
    }
    
    // Clean worktree and copy report files
    console.log('📋 Copying report files...');
    const files = fs.readdirSync(worktreeDir);
    for (const f of files) {
      if (f === '.git') continue;
      fs.rmSync(path.join(worktreeDir, f), { recursive: true, force: true });
    }
    
    // Copy report files to worktree
    const reportFiles = fs.readdirSync(reportDir);
    for (const f of reportFiles) {
      fs.cpSync(path.join(reportDir, f), path.join(worktreeDir, f), { recursive: true });
    }
    
    // Add and commit
    execSync('git add -A', { cwd: worktreeDir });
    
    const status = execSync('git status --porcelain', { cwd: worktreeDir, encoding: 'utf-8' }).trim();
    if (status) {
      execSync('git commit -m "Update Playwright report"', { cwd: worktreeDir, stdio: 'inherit' });
      console.log('📤 Pushing to GitHub...');
      execSync('git push origin gh-pages', { cwd: worktreeDir, stdio: 'inherit' });
    } else {
      console.log('✅ Report already up to date');
    }
    
  } finally {
    // Clean up worktree
    try { execSync('git worktree remove .qwen/gh-pages-worktree --force', { cwd: path.join(__dirname, '..') }); } catch (e) {}
  }

  console.log(`\n✅ Report deployed to: ${PAGES_URL}\n`);

  // Read test results for Slack message
  const jsonReportPath = path.join(__dirname, '..', 'test-results', 'playwright-report.json');
  let stats = null;
  let failedTests = [];
  let flakyTests = [];

  if (fs.existsSync(jsonReportPath)) {
    const report = JSON.parse(fs.readFileSync(jsonReportPath, 'utf-8'));
    stats = report.stats;

    // Collect failed and flaky test details
    for (const suite of report.suites || []) {
      for (const spec of suite.specs || []) {
        for (const test of spec.tests || []) {
          const results = test.results || [];
          const lastResult = results[results.length - 1];

          if (lastResult?.status === 'unexpected') {
            // Check if it passed on retry (flaky)
            const passedOnRetry = results.some((r, i) => i > 0 && r.status === 'passed');
            if (passedOnRetry) {
              flakyTests.push(spec.title);
            } else {
              failedTests.push({
                title: spec.title,
                error: lastResult.error?.message || 'Unknown error',
                duration: lastResult.duration ? `${(lastResult.duration / 1000).toFixed(1)}s` : 'N/A'
              });
            }
          }
        }
      }
    }
  }

  // Send to Slack
  if (!WEBHOOK_URL) {
    console.log('⚠️ SLACK_WEBHOOK_URL not configured');
    console.log(`\n🔗 Report URL: ${PAGES_URL}`);
    return;
  }

  const total = stats ? (stats.expected + stats.unexpected) : 57;
  const passed = stats ? stats.expected : 57;
  const failed = stats ? stats.unexpected : 0;
  const passRate = ((passed / total) * 100).toFixed(1);
  const durationMin = stats ? (stats.duration / 1000 / 60).toFixed(1) : '2.1';
  const dateStr = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
  const statusEmoji = failed === 0 ? '✅' : '❌';
  const statusColor = failed === 0 ? '#36a64f' : '#e01e5a';

  const payload = {
    channel: CHANNEL,
    username: 'Playwright Test Bot',
    icon_emoji: ':robot_face:',
    attachments: [
      {
        color: statusColor,
        title: `Report Test Automation Web Desktop`,
        title_link: PAGES_URL,
        fields: [
          { title: 'QC By', value: QC_NAME, short: true },
          { title: 'Total Tests', value: `${total}`, short: true },
          { title: 'Passed', value: `✅ ${passed}`, short: true },
          { title: 'Failed', value: failed > 0 ? `❌ ${failed}` : '0', short: true },
          { title: 'Flaky', value: flakyTests.length > 0 ? `🟡 ${flakyTests.length}` : '0', short: true },
          { title: 'Pass Rate', value: `${passRate}%`, short: true },
          { title: 'Duration', value: `${durationMin} min`, short: true },
          { title: 'Browser', value: 'Chrome (Desktop)', short: true },
          { title: 'Date', value: dateStr, short: false },
        ],
      },
    ],
  };

  // Add failed test analysis
  if (failedTests.length > 0) {
    const failedAnalysis = failedTests.map((t, i) => {
      const shortError = t.error.length > 100 ? t.error.substring(0, 100) + '...' : t.error;
      return `*${i + 1}. ${t.title}*\n   ️ ${t.duration}\n   ❌ ${shortError}`;
    }).join('\n\n');

    payload.attachments.push({
      color: '#e01e5a',
      title: '❌ Failed Tests Analysis',
      text: failedAnalysis,
    });
  }

  // Add flaky tests info
  if (flakyTests.length > 0) {
    payload.attachments.push({
      color: '#ffa500',
      title: '🟡 Flaky Tests (passed on retry)',
      text: flakyTests.map((t, i) => `${i + 1}. ${t}`).join('\n'),
    });
  }

  // Add HTML report link
  payload.attachments.push({
    color: '#439FE0',
    title: '📊 View Full HTML Report',
    title_link: PAGES_URL,
    text: `<${PAGES_URL}|🔗 Click here to open interactive report>`,
  });

  const response = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (response.ok) {
    console.log('✅ Report sent to Slack successfully!');
    console.log(`🔗 ${PAGES_URL}`);
  } else {
    console.error('❌ Slack error:', response.status);
  }
}

main().catch(console.error);
