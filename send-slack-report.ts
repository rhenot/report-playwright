import { execSync } from 'child_process';
import * as fs from 'fs';
import 'dotenv/config';

const WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL || '';
const CHANNEL = process.env.SLACK_CHANNEL || '#reny-report';

async function main() {
  console.log('🏃 Running Playwright tests...\n');

  // Run tests and capture JSON output
  let jsonOutput = '';
  try {
    jsonOutput = execSync(
      'npx playwright test tests/auth/login.specs.ts --project=chrome --reporter=json 2>/dev/null',
      { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 }
    );
  } catch (error: any) {
    // Tests may fail but JSON is still in stdout
    jsonOutput = error.stdout || '';
  }

  if (!jsonOutput) {
    console.error('❌ No test output received');
    process.exit(1);
  }

  // Parse JSON report
  const report = JSON.parse(jsonOutput);
  const stats = report.stats;
  const total = stats.expected + stats.unexpected;
  const passed = stats.expected;
  const failed = stats.unexpected;
  const passRate = ((passed / total) * 100).toFixed(1);
  const durationMin = (stats.duration / 1000 / 60).toFixed(1);

  // Get failed test details
  const failedTests: string[] = [];
  for (const suite of report.suites || []) {
    for (const spec of suite.specs || []) {
      for (const test of spec.tests || []) {
        const lastResult = test.results?.[test.results.length - 1];
        if (lastResult?.status === 'unexpected') {
          failedTests.push(`• *${spec.title}*`);
        }
      }
    }
  }

  console.log('📊 Test Results:');
  console.log(`   Total: ${total}`);
  console.log(`   Passed: ${passed}`);
  console.log(`   Failed: ${failed}`);
  console.log(`   Pass Rate: ${passRate}%\n`);

  // Build Slack payload
  const statusEmoji = failed === 0 ? '✅' : '⚠️';
  const statusColor = failed === 0 ? '#36a64f' : '#e01e5a';
  const dateStr = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });

  const payload: any = {
    channel: CHANNEL,
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
          { title: 'Pass Rate', value: `${passRate}%`, short: true },
          { title: 'Duration', value: `${durationMin} min`, short: true },
          { title: 'Date', value: dateStr, short: true },
        ],
      },
    ],
  };

  // Add failed tests if any
  if (failedTests.length > 0) {
    payload.attachments.push({
      color: '#e01e5a',
      title: '❌ Failed Tests',
      text: failedTests.join('\n'),
    });
  }

  // Send to Slack
  if (!WEBHOOK_URL || WEBHOOK_URL.includes('YOUR/WEBHOOK/URL')) {
    console.log('⚠️  Slack webhook URL not configured. Set SLACK_WEBHOOK_URL in .env');
    console.log('\n📋 Report Summary:');
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      console.log('✅ Report sent to Slack successfully!');
    } else {
      console.error('❌ Failed to send to Slack:', response.status, response.statusText);
      const text = await response.text();
      console.error('Response:', text);
    }
  } catch (error) {
    console.error('❌ Error sending to Slack:', error);
  }
}

main().catch(console.error);
