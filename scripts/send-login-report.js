const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const webhookUrl = process.env.SLACK_WEBHOOK_URL;
const channel = process.env.SLACK_CHANNEL || '#reny-report';

if (!webhookUrl) {
  console.error('❌ SLACK_WEBHOOK_URL not configured in .env');
  process.exit(1);
}

// Read the JSON report from test-results
const jsonReportPath = path.join(__dirname, '..', 'test-results', 'playwright-report.json');

if (!fs.existsSync(jsonReportPath)) {
  console.error('❌ JSON report not found at', jsonReportPath);
  process.exit(1);
}

const report = JSON.parse(fs.readFileSync(jsonReportPath, 'utf-8'));
const stats = report.stats;
const total = stats.expected + stats.unexpected;
const passed = stats.expected;
const failed = stats.unexpected;
const flaky = stats.flaky;
const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : '0.0';
const durationMin = (stats.duration / 1000 / 60).toFixed(1);

// Collect failed test names
const failedTests = [];
function collectFailed(suites) {
  for (const suite of suites || []) {
    for (const spec of suite.specs || []) {
      for (const test of spec.tests || []) {
        const lastResult = test.results?.[test.results.length - 1];
        if (lastResult?.status === 'unexpected') {
          failedTests.push(`• *${spec.title}*`);
        }
      }
    }
    collectFailed(suite.suites);
  }
}
collectFailed(report.suites);

const statusEmoji = failed === 0 ? '✅' : '⚠️';
const statusColor = failed === 0 ? '#36a64f' : '#e01e5a';
const dateStr = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });

const payload = {
  channel,
  username: 'Playwright Test Bot',
  icon_emoji: ':robot_face:',
  attachments: [
    {
      color: statusColor,
      title: `${statusEmoji} RCTI+ Login Page - Test Report`,
      title_link: 'https://www.rctiplus.com/login',
      fields: [
        { title: 'Total Tests', value: `${total}`, short: true },
        { title: 'Passed', value: `✅ ${passed}`, short: true },
        { title: 'Failed', value: failed > 0 ? `❌ ${failed}` : '0', short: true },
        { title: 'Flaky', value: flaky > 0 ? `🟡 ${flaky}` : '0', short: true },
        { title: 'Pass Rate', value: `${passRate}%`, short: true },
        { title: 'Duration', value: `${durationMin} min`, short: true },
        { title: 'Browser', value: 'Chrome (Desktop)', short: true },
        { title: 'Date', value: dateStr, short: false },
      ],
    },
  ],
};

if (failedTests.length > 0) {
  payload.attachments.push({
    color: '#e01e5a',
    title: '❌ Failed Tests',
    text: failedTests.join('\n'),
  });
}

fetch(webhookUrl, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
}).then(res => {
  if (res.ok) {
    console.log('✅ Report sent to Slack successfully!');
    console.log(`   Total: ${total} | Passed: ${passed} | Failed: ${failed} | Pass Rate: ${passRate}%`);
  } else {
    console.error('❌ Slack error:', res.status, res.statusText);
    res.text().then(t => console.error(t));
  }
}).catch(err => {
  console.error('❌ Error sending to Slack:', err.message);
});
