import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import 'dotenv/config';
import { SlackReporter, parsePlaywrightReport } from './utils/slack-reporter';

async function main() {
  console.log(' Running Playwright tests...\n');

  const reportDir = path.join(__dirname, 'playwright-report');
  const jsonReportPath = path.join(reportDir, 'report.json');

  // Ensure report directory exists
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  try {
    // Run tests with JSON reporter
    execSync(
      'npx playwright test tests/auth/login.specs.ts --project=chrome --reporter=json',
      {
        stdio: 'inherit',
        cwd: __dirname,
      }
    );
  } catch (error) {
    // Tests may fail but we still want to send report
    console.log('\n⚠️  Some tests failed, generating report anyway...\n');
  }

  // Read and parse JSON report
  if (fs.existsSync(jsonReportPath)) {
    const jsonReport = JSON.parse(fs.readFileSync(jsonReportPath, 'utf-8'));
    const slackReport = parsePlaywrightReport(jsonReport);

    console.log('\n📊 Test Summary:');
    console.log(`   Total: ${slackReport.total}`);
    console.log(`   Passed: ${slackReport.passed}`);
    console.log(`   Failed: ${slackReport.failed}`);
    console.log(`   Pass Rate: ${((slackReport.passed / slackReport.total) * 100).toFixed(1)}%`);
    console.log(`   Duration: ${(slackReport.duration / 1000 / 60).toFixed(1)} min\n`);

    // Send to Slack
    const reporter = new SlackReporter();
    await reporter.sendReport(slackReport);
  } else {
    console.error('❌ JSON report not found at:', jsonReportPath);
    process.exit(1);
  }
}

main().catch(console.error);
