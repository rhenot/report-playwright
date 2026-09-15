import 'dotenv/config';

interface TestResult {
  title: string;
  status: 'passed' | 'failed' | 'skipped' | 'timedOut';
  duration: number;
  error?: string;
}

interface TestSuite {
  title: string;
  specs: {
    title: string;
    tests: TestResult[];
  }[];
}

interface SlackReport {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  suites: TestSuite[];
}

export class SlackReporter {
  private webhookUrl: string;
  private channel: string;

  constructor() {
    this.webhookUrl = process.env.SLACK_WEBHOOK_URL || '';
    this.channel = process.env.SLACK_CHANNEL || '#test-reports';
  }

  async sendReport(report: SlackReport): Promise<void> {
    if (!this.webhookUrl || this.webhookUrl.includes('YOUR/WEBHOOK/URL')) {
      console.log('️  Slack webhook URL not configured. Set SLACK_WEBHOOK_URL in .env');
      return;
    }

    const passRate = ((report.passed / report.total) * 100).toFixed(1);
    const durationMin = (report.duration / 1000 / 60).toFixed(1);

    const statusEmoji = report.failed === 0 ? '✅' : '⚠️';
    const statusColor = report.failed === 0 ? '#36a64f' : '#e01e5a';

    const payload = {
      channel: this.channel,
      username: 'Playwright Test Bot',
      icon_emoji: ':robot_face:',
      attachments: [
        {
          color: statusColor,
          title: `${statusEmoji} RCTI+ Login Page - Test Report`,
          title_link: 'https://www.rctiplus.com/login',
          fields: [
            {
              title: 'Total Tests',
              value: `${report.total}`,
              short: true,
            },
            {
              title: 'Passed',
              value: `✅ ${report.passed}`,
              short: true,
            },
            {
              title: 'Failed',
              value: report.failed > 0 ? `❌ ${report.failed}` : '0',
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
              value: new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }),
              short: true,
            },
          ],
        },
      ],
    };

    // Add failed tests details if any
    if (report.failed > 0) {
      const failedTests = this.getFailedTests(report);
      if (failedTests.length > 0) {
        payload.attachments.push({
          color: '#e01e5a',
          title: '❌ Failed Tests',
          text: failedTests.map((t, i) => `${i + 1}. *${t.suite}* → ${t.test}`).join('\n'),
        });
      }
    }

    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        console.log('✅ Report sent to Slack successfully');
      } else {
        console.error('❌ Failed to send report to Slack:', response.statusText);
      }
    } catch (error) {
      console.error('❌ Error sending report to Slack:', error);
    }
  }

  private getFailedTests(report: SlackReport): { suite: string; test: string }[] {
    const failed: { suite: string; test: string }[] = [];
    for (const suite of report.suites) {
      for (const spec of suite.specs) {
        for (const test of spec.tests) {
          if (test.status === 'failed') {
            failed.push({ suite: suite.title, test: spec.title });
          }
        }
      }
    }
    return failed;
  }
}

// Helper to parse Playwright JSON report
export function parsePlaywrightReport(jsonReport: any): SlackReport {
  const suites: TestSuite[] = [];
  let total = 0;
  let passed = 0;
  let failed = 0;
  let skipped = 0;
  let duration = 0;

  for (const suite of jsonReport.suites || []) {
    const testSuite: TestSuite = { title: suite.title, specs: [] };

    for (const spec of suite.specs || []) {
      const tests: TestResult[] = [];

      for (const test of spec.tests || []) {
        const result = test.results?.[test.results.length - 1];
        const status = result?.status || 'skipped';
        const testResult: TestResult = {
          title: test.title,
          status,
          duration: result?.duration || 0,
          error: result?.error?.message,
        };
        tests.push(testResult);

        total++;
        if (status === 'passed') passed++;
        else if (status === 'failed') failed++;
        else if (status === 'skipped') skipped++;

        duration += testResult.duration;
      }

      testSuite.specs.push({ title: spec.title, tests });
    }

    if (testSuite.specs.length > 0) {
      suites.push(testSuite);
    }
  }

  return { total, passed, failed, skipped, duration, suites };
}
