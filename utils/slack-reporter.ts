import { execSync } from 'child_process';
import * as fs from 'fs';
import 'dotenv/config';

const WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL || '';
const CHANNEL = process.env.SLACK_CHANNEL || '#reny-report';
const REPORT_URL = process.env.REPORT_URL || '';

const JSON_REPORT = 'test-results/playwright-report.json';

async function main() {
  console.log('🏃 Running Playwright tests...\n');

  // Pastikan folder test-results tersedia
  fs.mkdirSync('test-results', { recursive: true });

  let testExitCode = 0;

  try {
    execSync(
      `npx playwright test tests/auth/login.specs.ts --project=chrome`,
      {
        stdio: 'inherit',
        encoding: 'utf-8',
      }
    );
  } catch (error: any) {
    testExitCode = error.status || 1;
  }

  console.log('\n📊 Reading Playwright JSON report...\n');

  if (!fs.existsSync(JSON_REPORT)) {
    console.error(`❌ JSON report tidak ditemukan: ${JSON_REPORT}`);
    process.exit(testExitCode || 1);
  }

  const report = JSON.parse(
    fs.readFileSync(JSON_REPORT, 'utf-8')
  );

  const stats = report.stats;

  const total =
    (stats.expected || 0) +
    (stats.unexpected || 0) +
    (stats.skipped || 0);

  const passed = stats.expected || 0;
  const failed = stats.unexpected || 0;
  const skipped = stats.skipped || 0;

  const executed = passed + failed;

  const passRate =
    executed > 0
      ? ((passed / executed) * 100).toFixed(1)
      : '0.0';

  const durationMin =
    ((stats.duration || 0) / 1000 / 60).toFixed(1);

  // ============================================
  // FAILED TESTS
  // ============================================

  const failedTests: string[] = [];

  for (const suite of report.suites || []) {
    for (const spec of suite.specs || []) {
      for (const test of spec.tests || []) {
        const lastResult =
          test.results?.[test.results.length - 1];

        if (lastResult?.status === 'unexpected') {
          failedTests.push(`• ${spec.title}`);
        }
      }
    }
  }

  // ============================================
  // CONSOLE SUMMARY
  // ============================================

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚀 PLAYWRIGHT TEST SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Total       : ${total}`);
  console.log(`Passed      : ${passed}`);
  console.log(`Failed      : ${failed}`);
  console.log(`Skipped     : ${skipped}`);
  console.log(`Pass Rate   : ${passRate}%`);
  console.log(`Duration    : ${durationMin} min`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // ============================================
  // SLACK PAYLOAD
  // ============================================

  const status = failed === 0 ? 'PASSED' : 'FAILED';

  const statusEmoji =
    failed === 0 ? '✅' : '❌';

  const statusColor =
    failed === 0 ? '#36a64f' : '#e01e5a';

  const dateStr = new Date().toLocaleString(
    'id-ID',
    {
      timeZone: 'Asia/Jakarta',
    }
  );

  const payload: any = {
    username: 'Playwright Test Bot',
    icon_emoji: ':robot_face:',
    attachments: [
      {
        color: statusColor,

        title: `${statusEmoji} RCTI+ WebD - Playwright Test Report`,

        fields: [
          {
            title: 'Status',
            value: `${statusEmoji} ${status}`,
            short: true,
          },
          {
            title: 'Total Tests',
            value: `${total}`,
            short: true,
          },
          {
            title: 'Passed',
            value: `✅ ${passed}`,
            short: true,
          },
          {
            title: 'Failed',
            value: failed > 0 ? `❌ ${failed}` : '0',
            short: true,
          },
          {
            title: 'Skipped',
            value: `${skipped}`,
            short: true,
          },
          {
            title: 'Pass Rate',
            value: `${passRate}%`,
            short: true,
          },
          {
            title: 'Duration',
            value: `${durationMin} min`,
            short: true,
          },
          {
            title: 'Date',
            value: dateStr,
            short: true,
          },
        ],
      },
    ],
  };

  // ============================================
  // FAILED TEST DETAILS
  // ============================================

  if (failedTests.length > 0) {
    payload.attachments.push({
      color: '#e01e5a',
      title: '❌ Failed Tests',
      text: failedTests.join('\n'),
    });
  }

  // ============================================
  // HTML REPORT LINK
  // ============================================

  if (REPORT_URL) {
    payload.attachments.push({
      color: '#439FE0',
      title: '📊 Playwright HTML Report',
      title_link: REPORT_URL,
      text: `<${REPORT_URL}|🔗 Open Full HTML Report>`,
    });
  } else {
    payload.attachments.push({
      color: '#cccccc',
      title: '📊 Playwright HTML Report',
      text: 'REPORT_URL belum dikonfigurasi.',
    });
  }

  // ============================================
  // SEND TO SLACK
  // ============================================

  if (
    !WEBHOOK_URL ||
    WEBHOOK_URL.includes('YOUR/WEBHOOK/URL')
  ) {
    console.log(
      '⚠️ SLACK_WEBHOOK_URL belum dikonfigurasi.'
    );

    console.log(
      JSON.stringify(payload, null, 2)
    );

    process.exit(testExitCode || 0);
  }

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      console.log(
        '✅ Report sent to Slack successfully!'
      );
    } else {
      console.error(
        '❌ Failed to send to Slack:',
        response.status,
        response.statusText
      );

      const text = await response.text();

      console.error('Response:', text);
    }
  } catch (error) {
    console.error(
      '❌ Error sending to Slack:',
      error
    );
  }

  // Return Playwright exit status
  process.exit(testExitCode);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});