const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Load .env manually
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#][^=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    let value = match[2].trim();
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
});

const WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL || '';
const CHANNEL = process.env.SLACK_CHANNEL || '#report-automate';

const testFile = process.argv[2] || 'tests/auth/login.specs.ts';
const testTitle = process.argv[3] || 'RCTI+ Test Report';
const testUrl = process.argv[4] || 'https://www.rctiplus.com';

async function main() {
  console.log(`🏃 Running Playwright tests: ${testFile}\n`);

  let jsonOutput = '';
  try {
    jsonOutput = execSync(
      `npx playwright test ${testFile} --reporter=json 2>/dev/null`,
      { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 }
    );
  } catch (error) {
    jsonOutput = error.stdout || '';
  }

  if (!jsonOutput) {
    console.error('❌ No test output received');
    process.exit(1);
  }

  const report = JSON.parse(jsonOutput);
  const stats = report.stats;
  
  // Count by status
  let passed = 0, failed = 0, flaky = 0, interrupted = 0, skipped = 0;
  const failedTests = [];
  const flakyTests = [];
  const interruptedTests = [];
  const allTests = [];

  function processSuites(suites, parentTitle = '') {
    for (const suite of suites || []) {
      const suiteTitle = suite.title || parentTitle;
      const hasSpecs = suite.specs && suite.specs.length > 0;
      const hasNestedSuites = suite.suites && suite.suites.length > 0;

      for (const spec of suite.specs || []) {
        for (const test of spec.tests || []) {
          // Get all results to detect flaky
          const results = test.results || [];
          const lastResult = results[results.length - 1];
          const status = lastResult?.status || 'skipped';
          
          // Check if flaky (passed after failures)
          const isFlaky = results.length > 1 && results.some((r, i) => 
            i < results.length - 1 && r.status !== 'expected'
          ) && lastResult.status === 'expected';

          const icon = status === 'expected' ? '✅' : status === 'unexpected' ? '❌' : status === 'interrupted' ? '⛔' : '⏭️';
          const project = test.projectName || '';
          const file = spec.file || '';
          const line = test.line || 0;
          const column = test.column || 0;

          const testInfo = {
            suite: suiteTitle,
            name: spec.title,
            status: status,
            icon: icon,
            project: project,
            file: file,
            line: line,
            column: column,
            error: lastResult?.error?.message?.substring(0, 200) || '',
            isFlaky: isFlaky
          };

          allTests.push(testInfo);

          if (isFlaky) {
            flaky++;
            flakyTests.push(testInfo);
          } else if (status === 'expected') {
            passed++;
          } else if (status === 'unexpected') {
            failed++;
            failedTests.push(testInfo);
          } else if (status === 'interrupted') {
            interrupted++;
            interruptedTests.push(testInfo);
          } else {
            skipped++;
          }
        }
      }

      if (hasNestedSuites) {
        processSuites(suite.suites, suiteTitle);
      }
    }
  }

  processSuites(report.suites || []);

  const total = passed + failed + flaky + interrupted + skipped;
  const passRate = total > 0 ? (((passed + flaky) / total) * 100).toFixed(1) : '0.0';
  const durationMin = (stats.duration / 1000 / 60).toFixed(1);

  console.log('📊 Test Results:');
  console.log(`   Passed: ${passed}`);
  console.log(`   Failed: ${failed}`);
  console.log(`   Flaky: ${flaky}`);
  console.log(`   Interrupted: ${interrupted}`);
  console.log(`   Did not run: ${skipped}`);
  console.log(`   Total: ${total}`);
  console.log(`   Pass Rate: ${passRate}%`);
  console.log(`   Duration: ${durationMin} min\n`);

  const statusEmoji = failed === 0 && interrupted === 0 ? '✅' : '⚠️';
  const statusColor = failed === 0 && interrupted === 0 ? '#36a64f' : '#e01e5a';
  const dateStr = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });

  const payload = {
    channel: CHANNEL,
    username: 'Playwright Test Bot',
    icon_emoji: ':robot_face:',
    attachments: [
      {
        color: statusColor,
        title: `${statusEmoji} ${testTitle}`,
        title_link: testUrl,
        fields: [
          { title: 'Passed', value: `${passed}`, short: true },
          { title: 'Failed', value: `${failed}`, short: true },
          { title: 'Flaky', value: `${flaky}`, short: true },
          { title: 'Interrupted', value: `${interrupted}`, short: true },
          { title: 'Did not run', value: `${skipped}`, short: true },
          { title: 'Duration', value: `${durationMin} min`, short: true },
          { title: 'Pass Rate', value: `${passRate}%`, short: false },
          { title: 'Date', value: dateStr, short: false },
        ],
      },
    ],
  };

  // Failed Tests Section
  if (failedTests.length > 0) {
    let failedText = `*${failed} failed*\n\n`;
    failedTests.forEach((test, i) => {
      failedText += `  *${i + 1})* [${test.project}] › ${test.file}:${test.line}:${test.column} › ${test.suite} › ${test.name}\n\n`;
      if (test.error) {
        failedText += `    Error: ${test.error.substring(0, 150)}\n\n`;
      }
    });

    payload.attachments.push({
      color: '#e01e5a',
      title: `❌ ${failed} failed`,
      text: failedText.substring(0, 3000),
    });
  }

  // Interrupted Tests Section
  if (interruptedTests.length > 0) {
    let interruptedText = `*${interrupted} interrupted*\n\n`;
    interruptedTests.forEach((test, i) => {
      interruptedText += `  *${i + 1})* [${test.project}] › ${test.file}:${test.line}:${test.column} › ${test.suite} › ${test.name}\n\n`;
    });

    payload.attachments.push({
      color: '#ff9900',
      title: `⛔ ${interrupted} interrupted`,
      text: interruptedText.substring(0, 3000),
    });
  }

  // Flaky Tests Section
  if (flakyTests.length > 0) {
    let flakyText = `*${flaky} flaky*\n\n`;
    flakyTests.forEach((test, i) => {
      flakyText += `  *${i + 1})* [${test.project}] › ${test.file}:${test.line}:${test.column} › ${test.suite} › ${test.name}\n`;
    });

    payload.attachments.push({
      color: '#ffcc00',
      title: `⚠️ ${flaky} flaky`,
      text: flakyText.substring(0, 3000),
    });
  }

  // Did not run Section
  if (skipped > 0) {
    payload.attachments.push({
      color: '#808080',
      title: `️ ${skipped} did not run`,
      text: 'Some tests were skipped or did not execute.',
    });
  }

  // Summary
  payload.attachments.push({
    color: '#36a64f',
    title: `✅ ${passed} passed (${durationMin} min)`,
    text: `Total: ${total} test cases | Pass Rate: ${passRate}%`,
  });

  if (!WEBHOOK_URL || WEBHOOK_URL.includes('YOUR/WEBHOOK/URL')) {
    console.log('⚠️  Slack webhook URL not configured.');
    console.log('\n📋 Report that would be sent:');
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
