const fs = require('fs');
const path = require('path');
require('dotenv').config();

/*
=========================================================
RCTI+ PLAYWRIGHT CUSTOM REPORT
=========================================================

Project structure:

WebD-pw/
├── assets/
│   └── rcti-logo.png
├── playwright-report/
│   └── index.html
├── test-results/
│   └── playwright-report.json
├── custom-report.html
└── generate-custom-report.js

Run:

npx playwright test
node generate-custom-report.js

=========================================================
*/


// ======================================================
// CONFIGURATION
// ======================================================

const ROOT_DIR = __dirname;

const JSON_REPORT = path.join(
  ROOT_DIR,
  'test-results',
  'playwright-report.json'
);

const PLAYWRIGHT_REPORT_DIR = path.join(
  ROOT_DIR,
  'playwright-report'
);

const CUSTOM_REPORT = path.join(
  ROOT_DIR,
  'custom-report.html'
);

const ASSETS_DIR = path.join(
  ROOT_DIR,
  'assets'
);

const LOGO_FILE = path.join(
  ASSETS_DIR,
  'rcti-logo.png'
);

const QC_NAME =
  process.env.QC_NAME || 'Reny';

const BROWSER =
  process.env.TEST_BROWSER || 'Chrome (Desktop)';

const BASE_URL =
  process.env.BASE_URL || 'https://www.rctiplus.com';


// ======================================================
// CHECK JSON REPORT
// ======================================================

console.log('');
console.log('==============================================');
console.log('   RCTI+ CUSTOM PLAYWRIGHT REPORT');
console.log('==============================================');
console.log('');

console.log('🔍 Checking Playwright JSON report...');

if (!fs.existsSync(JSON_REPORT)) {

  console.error('');
  console.error(
    '❌ Playwright JSON report tidak ditemukan:'
  );

  console.error('');
  console.error(JSON_REPORT);

  console.error('');
  console.error(
    'Jalankan terlebih dahulu:'
  );

  console.error('');
  console.error(
    'npx playwright test'
  );

  console.error('');

  process.exit(1);
}

console.log('✅ JSON report ditemukan');


// ======================================================
// READ JSON
// ======================================================

let report;

try {

  report = JSON.parse(
    fs.readFileSync(
      JSON_REPORT,
      'utf8'
    )
  );

} catch (error) {

  console.error(
    '❌ Gagal membaca JSON report:'
  );

  console.error(error.message);

  process.exit(1);
}


// ======================================================
// STATISTICS
// ======================================================

const stats = report.stats || {};


// Playwright JSON normally uses:
// expected
// unexpected
// skipped
// flaky

const passed =
  Number(stats.expected || 0);

const failed =
  Number(stats.unexpected || 0);

const skipped =
  Number(stats.skipped || 0);

const flaky =
  Number(stats.flaky || 0);


// ======================================================
// TOTAL
// ======================================================

const total =
  passed +
  failed +
  skipped;


// ======================================================
// EXECUTED
// ======================================================

const executed =
  passed +
  failed;


// ======================================================
// PASS RATE
// ======================================================

const passRate =
  total > 0
    ? ((passed / total) * 100).toFixed(1)
    : '0.0';


// ======================================================
// FAILURE RATE
// ======================================================

const failureRate =
  total > 0
    ? ((failed / total) * 100).toFixed(1)
    : '0.0';


// ======================================================
// FLAKY RATE
// ======================================================

const flakyRate =
  total > 0
    ? ((flaky / total) * 100).toFixed(1)
    : '0.0';


// ======================================================
// DURATION
// ======================================================

const durationSeconds =
  Number(stats.duration || 0) / 1000;

const durationMinutes =
  (durationSeconds / 60).toFixed(1);


// ======================================================
// DATE
// ======================================================

const now = new Date();

const dateFormatter =
  new Intl.DateTimeFormat(
    'en-GB',
    {
      timeZone: 'Asia/Jakarta',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }
  );

const timeFormatter =
  new Intl.DateTimeFormat(
    'en-GB',
    {
      timeZone: 'Asia/Jakarta',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }
  );

const executionDate =
  dateFormatter.format(now);

const executionTime =
  timeFormatter.format(now);


// ======================================================
// STATUS
// ======================================================

let statusClass;
let statusIcon;
let statusTitle;
let statusMessage;

if (failed === 0 && flaky === 0) {

  statusClass = 'success';

  statusIcon = '✓';

  statusTitle =
    'All Tests Passed';

  statusMessage =
    'All automated test scenarios completed successfully.';

} else if (failed > 0) {

  statusClass = 'danger';

  statusIcon = '×';

  statusTitle =
    'Test Issues Detected';

  statusMessage =
    `${failed} automated test(s) failed and require investigation.`;

} else {

  statusClass = 'warning';

  statusIcon = '~';

  statusTitle =
    'Passed with Flaky Tests';

  statusMessage =
    `${flaky} test(s) passed after retry.`;
}


// ======================================================
// ESCAPE HTML
// ======================================================

function escapeHtml(value) {

  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}


// ======================================================
// COLLECT TESTS
// ======================================================

const failedTests = [];
const flakyTests = [];
const skippedTests = [];


function processSuite(suite) {

  for (
    const spec of suite.specs || []
  ) {

    for (
      const test of spec.tests || []
    ) {

      const results =
        test.results || [];

      if (
        results.length === 0
      ) {
        continue;
      }


      const lastResult =
        results[results.length - 1];


      // ----------------------------------------------
      // FAILED
      // ----------------------------------------------

      if (
        lastResult &&
        lastResult.status === 'unexpected'
      ) {

        failedTests.push({

          title:
            spec.title || 'Untitled Test',

          duration:
            lastResult.duration
              ? (
                  lastResult.duration / 1000
                ).toFixed(1) + 's'
              : '-',

          error:
            lastResult.error?.message ||
            lastResult.errors?.[0]?.message ||
            'Unknown error'

        });

      }


      // ----------------------------------------------
      // FLAKY
      // ----------------------------------------------

      const passedOnRetry =
        results.some(
          (result, index) => {

            return (
              index > 0 &&
              result.status === 'passed'
            );

          }
        );

      if (
        passedOnRetry
      ) {

        flakyTests.push({

          title:
            spec.title || 'Untitled Test'

        });

      }


      // ----------------------------------------------
      // SKIPPED
      // ----------------------------------------------

      if (
        lastResult.status === 'skipped'
      ) {

        skippedTests.push({

          title:
            spec.title || 'Untitled Test'

        });

      }

    }

  }


  // Nested suites

  for (
    const child of suite.suites || []
  ) {

    processSuite(child);

  }

}


for (
  const suite of report.suites || []
) {

  processSuite(suite);

}


// ======================================================
// LOGO
// ======================================================

let logoHtml = '';

if (
  fs.existsSync(LOGO_FILE)
) {

  /*
  Convert logo to Base64 so it works even when
  custom-report.html is opened independently.
  */

  const logoBuffer =
    fs.readFileSync(LOGO_FILE);

  const logoBase64 =
    logoBuffer.toString('base64');

  logoHtml = `
    <img
      src="data:image/png;base64,${logoBase64}"
      class="logo"
      alt="RCTI+"
    >
  `;

} else {

  console.warn('');
  console.warn(
    '⚠️ Logo tidak ditemukan:'
  );

  console.warn(LOGO_FILE);

  logoHtml = `
    <div class="logo-text">
      RCTI<span>+</span>
    </div>
  `;
}


// ======================================================
// FAILED TEST HTML
// ======================================================

let failedHtml = '';

if (
  failedTests.length > 0
) {

  failedHtml = `

  <section class="section danger-section">

    <div class="section-header">

      <div class="section-header-icon danger-icon">
        ×
      </div>

      <div>

        <h2>
          Failed Test Analysis
        </h2>

        <p>
          ${failedTests.length}
          test(s) require investigation
        </p>

      </div>

    </div>


    <div class="test-list">

      ${failedTests
        .map(
          (test, index) => `

        <div class="failed-test">

          <div class="test-index">
            ${index + 1}
          </div>

          <div class="test-information">

            <div class="test-name">
              ${escapeHtml(test.title)}
            </div>

            <div class="test-duration">
              Duration: ${escapeHtml(test.duration)}
            </div>

            <div class="error-message">
              ${escapeHtml(test.error)}
            </div>

          </div>

        </div>

      `
        )
        .join('')}

    </div>

  </section>

  `;

} else {

  failedHtml = `

  <section class="section clean-section">

    <div class="clean-icon">
      ✓
    </div>

    <div>

      <h2>
        No Failed Tests
      </h2>

      <p>
        All automated test scenarios
        completed successfully.
      </p>

    </div>

  </section>

  `;

}


// ======================================================
// FLAKY HTML
// ======================================================

let flakyHtml = '';

if (
  flakyTests.length > 0
) {

  flakyHtml = `

  <section class="section warning-section">

    <div class="section-header">

      <div class="section-header-icon warning-icon">
        ~
      </div>

      <div>

        <h2>
          Flaky Tests
        </h2>

        <p>
          Passed after retry
        </p>

      </div>

    </div>


    <div class="flaky-list">

      ${flakyTests
        .map(
          (test, index) => `

        <div class="flaky-test">

          <span class="flaky-number">
            ${index + 1}
          </span>

          ${escapeHtml(test.title)}

        </div>

      `
        )
        .join('')}

    </div>

  </section>

  `;

}


// ======================================================
// SKIPPED HTML
// ======================================================

let skippedHtml = '';

if (
  skippedTests.length > 0
) {

  skippedHtml = `

  <section class="section skipped-section">

    <div class="section-header">

      <div class="section-header-icon skipped-icon">
        –
      </div>

      <div>

        <h2>
          Skipped Tests
        </h2>

        <p>
          ${skippedTests.length}
          test(s) skipped
        </p>

      </div>

    </div>

  </section>

  `;

}


// ======================================================
// DONUT
// ======================================================

const passedPercentage =
  Math.max(
    0,
    Math.min(
      100,
      Number(passRate)
    )
  );


// ======================================================
// CUSTOM REPORT HTML
// ======================================================

const html = `

<!DOCTYPE html>

<html lang="en">

<head>

<meta charset="UTF-8">

<meta
  name="viewport"
  content="width=device-width, initial-scale=1.0"
>

<title>
  RCTI+ Test Automation Report
</title>


<style>

/* =====================================================
   RESET
===================================================== */

* {
  box-sizing: border-box;
}


body {

  margin: 0;

  font-family:
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Arial,
    Helvetica,
    sans-serif;

  background:
    #f4f7fb;

  color:
    #12284c;

}


/* =====================================================
   CONTAINER
===================================================== */

.container {

  max-width: 1500px;

  margin: 0 auto;

  padding: 32px;

}


/* =====================================================
   HEADER
===================================================== */

.header {

  display: flex;

  justify-content: space-between;

  align-items: center;

  gap: 30px;

  margin-bottom: 25px;

}


.brand {

  display: flex;

  align-items: center;

  gap: 25px;

}


.logo {

  width: 175px;

  height: auto;

  display: block;

}


.logo-text {

  font-size: 56px;

  font-weight: 900;

  color: #0a9fd2;

  letter-spacing: -5px;

}


.logo-text span {

  color: #f7941d;

}


.header-divider {

  width: 1px;

  height: 85px;

  background:
    #cbd5e1;

}


.title h1 {

  margin: 0;

  font-size: 42px;

  font-weight: 800;

  color:
    #102b55;

}


.title h2 {

  margin: 6px 0 0;

  font-size: 28px;

  font-weight: 700;

  color:
    #173b70;

}


.tagline {

  margin-top: 9px;

  font-size: 17px;

  color:
    #60738f;

}


.execution {

  display: flex;

  align-items: center;

  gap: 16px;

  padding: 20px 25px;

  min-width: 330px;

  border-radius: 18px;

  background:
    linear-gradient(
      135deg,
      #edf5ff,
      #f8fbff
    );

}


.execution-icon {

  font-size: 40px;

}


.execution-label {

  font-size: 15px;

  color:
    #64748b;

}


.execution-date {

  margin-top: 4px;

  font-size: 20px;

  font-weight: 800;

  color:
    #102b55;

}


.execution-time {

  margin-top: 3px;

  font-size: 15px;

  color:
    #64748b;

}


/* =====================================================
   DASHBOARD
===================================================== */

.dashboard {

  display: grid;

  grid-template-columns:
    1fr
    1.1fr
    1fr;

  gap: 20px;

}


.card {

  background:
    #ffffff;

  border-radius: 20px;

  padding: 28px;

  box-shadow:
    0 8px 30px
    rgba(
      15,
      50,
      90,
      .07
    );

}


/* =====================================================
   INFORMATION CARD
===================================================== */

.info-card {

  background:
    linear-gradient(
      135deg,
      #edf7ff,
      #f9fcff
    );

}


.info-row {

  display: flex;

  align-items: center;

  gap: 18px;

  margin-bottom: 25px;

}


.info-row:last-child {

  margin-bottom: 0;

}


.info-icon {

  width: 55px;

  height: 55px;

  border-radius: 50%;

  display: flex;

  align-items: center;

  justify-content: center;

  font-size: 25px;

  background:
    #dff1ff;

}


.info-label {

  font-size: 15px;

  font-weight: 700;

  color:
    #526987;

}


.info-value {

  margin-top: 4px;

  font-size: 18px;

  font-weight: 700;

  color:
    #173b70;

}


/* =====================================================
   CHART
===================================================== */

.chart-card {

  display: flex;

  flex-direction: column;

  justify-content: center;

  align-items: center;

}


.donut {

  width: 330px;

  height: 330px;

  border-radius: 50%;

  display: flex;

  align-items: center;

  justify-content: center;

  position: relative;

  background:
    conic-gradient(
      #18ae56 ${passedPercentage}%,
      #e63b45 ${passedPercentage}% 100%
    );

}


.donut::before {

  content: "";

  position: absolute;

  width: 215px;

  height: 215px;

  border-radius: 50%;

  background:
    white;

}


.donut-content {

  position: relative;

  z-index: 2;

  text-align: center;

}


.donut-number {

  font-size: 58px;

  font-weight: 900;

  color:
    #102b55;

}


.donut-label {

  margin-top: 2px;

  font-size: 21px;

  font-weight: 600;

  color:
    #526987;

}


.donut-rate {

  margin-top: 8px;

  font-size: 20px;

  font-weight: 800;

  color:
    #18a653;

}


/* =====================================================
   LEGEND
===================================================== */

.legend {

  display: flex;

  justify-content: center;

  gap: 28px;

  margin-top: 25px;

}


.legend-item {

  text-align: center;

}


.legend-title {

  font-size: 15px;

  font-weight: 700;

}


.legend-value {

  margin-top: 4px;

  font-size: 14px;

  color:
    #64748b;

}


.dot {

  display: inline-block;

  width: 11px;

  height: 11px;

  border-radius: 50%;

  margin-right: 5px;

}


.dot-green {

  background:
    #18ae56;

}


.dot-red {

  background:
    #e63b45;

}


.dot-yellow {

  background:
    #ffb31a;

}


/* =====================================================
   KPI
===================================================== */

.kpi-stack {

  display: flex;

  flex-direction: column;

  gap: 15px;

}


.kpi {

  display: flex;

  align-items: center;

  justify-content: space-between;

  padding: 23px;

  border-radius: 18px;

}


.kpi-left {

  display: flex;

  align-items: center;

  gap: 16px;

}


.kpi-icon {

  width: 65px;

  height: 65px;

  border-radius: 50%;

  display: flex;

  align-items: center;

  justify-content: center;

  color:
    white;

  font-size: 34px;

  font-weight: 800;

}


.kpi-title {

  font-size: 16px;

  font-weight: 700;

}


.kpi-number {

  margin-top: 3px;

  font-size: 38px;

  font-weight: 900;

}


.kpi-percent {

  font-size: 29px;

  font-weight: 900;

}


.kpi-rate-label {

  margin-top: 2px;

  font-size: 13px;

  color:
    #64748b;

}


.kpi.passed {

  background:
    #edfbf2;

}


.kpi.passed .kpi-icon {

  background:
    #18ae56;

}


.kpi.failed {

  background:
    #fff0f1;

}


.kpi.failed .kpi-icon {

  background:
    #e63b45;

}


.kpi.flaky {

  background:
    #fff8e6;

}


.kpi.flaky .kpi-icon {

  background:
    #ffb31a;

}


/* =====================================================
   STATUS
===================================================== */

.status-card {

  margin-top: 20px;

  padding: 30px 35px;

  border-radius: 20px;

  display: flex;

  justify-content: space-between;

  align-items: center;

  gap: 25px;

}


.status-card.success {

  background:
    linear-gradient(
      135deg,
      #ecfbf2,
      #f8fffb
    );

}


.status-card.danger {

  background:
    linear-gradient(
      135deg,
      #fff0f1,
      #fff9f9
    );

}


.status-card.warning {

  background:
    linear-gradient(
      135deg,
      #fff8e6,
      #fffdf7
    );

}


.status-left {

  display: flex;

  align-items: center;

  gap: 22px;

}


.status-icon {

  width: 95px;

  height: 95px;

  border-radius: 50%;

  display: flex;

  align-items: center;

  justify-content: center;

  color: white;

  font-size: 55px;

  font-weight: 900;

}


.success .status-icon {

  background:
    #18ae56;

}


.danger .status-icon {

  background:
    #e63b45;

}


.warning .status-icon {

  background:
    #ffb31a;

}


.status-title {

  margin: 0;

  font-size: 30px;

  font-weight: 900;

}


.success .status-title {

  color:
    #087e3d;

}


.danger .status-title {

  color:
    #c62933;

}


.warning .status-title {

  color:
    #a66d00;

}


.status-message {

  margin-top: 6px;

  font-size: 18px;

  font-weight: 700;

}


.status-description {

  margin-top: 6px;

  font-size: 15px;

  color:
    #60738f;

}


.quote {

  max-width: 330px;

  padding-left: 25px;

  border-left:
    1px solid #b9c5d5;

  color:
    #60738f;

  font-size: 16px;

  line-height: 1.6;

  font-style: italic;

}


.quote-author {

  margin-top: 5px;

  font-style: normal;

  font-weight: 700;

  color:
    #16894a;

}


/* =====================================================
   SECTIONS
===================================================== */

.section {

  margin-top: 20px;

  padding: 28px;

  background:
    white;

  border-radius: 20px;

  box-shadow:
    0 8px 30px
    rgba(
      15,
      50,
      90,
      .05
    );

}


.danger-section {

  border-left:
    6px solid #e63b45;

}


.warning-section {

  border-left:
    6px solid #ffb31a;

}


.skipped-section {

  border-left:
    6px solid #94a3b8;

}


.clean-section {

  display: flex;

  align-items: center;

  gap: 18px;

  border-left:
    6px solid #18ae56;

}


.clean-icon {

  width: 55px;

  height: 55px;

  border-radius: 50%;

  display: flex;

  align-items: center;

  justify-content: center;

  background:
    #18ae56;

  color:
    white;

  font-size: 30px;

  font-weight: 900;

}


.clean-section h2 {

  margin: 0;

  color:
    #087e3d;

}


.clean-section p {

  margin: 5px 0 0;

  color:
    #64748b;

}


.section-header {

  display: flex;

  align-items: center;

  gap: 15px;

  margin-bottom: 20px;

}


.section-header-icon {

  width: 48px;

  height: 48px;

  border-radius: 50%;

  display: flex;

  align-items: center;

  justify-content: center;

  color:
    white;

  font-size: 27px;

  font-weight: 900;

}


.danger-icon {

  background:
    #e63b45;

}


.warning-icon {

  background:
    #ffb31a;

}


.skipped-icon {

  background:
    #94a3b8;

}


.section-header h2 {

  margin: 0;

  font-size: 23px;

}


.section-header p {

  margin: 4px 0 0;

  color:
    #64748b;

}


/* =====================================================
   FAILED LIST
===================================================== */

.failed-test {

  display: flex;

  gap: 15px;

  padding: 18px;

  margin-bottom: 12px;

  border-radius: 12px;

  background:
    #fff5f5;

}


.test-index {

  min-width: 32px;

  width: 32px;

  height: 32px;

  border-radius: 50%;

  display: flex;

  align-items: center;

  justify-content: center;

  background:
    #e63b45;

  color:
    white;

  font-weight: 800;

}


.test-information {

  min-width: 0;

}


.test-name {

  font-weight: 800;

  font-size: 16px;

}


.test-duration {

  margin-top: 5px;

  color:
    #64748b;

  font-size: 13px;

}


.error-message {

  margin-top: 8px;

  color:
    #b4232c;

  font-size: 13px;

  line-height: 1.5;

  word-break: break-word;

}


/* =====================================================
   FLAKY
===================================================== */

.flaky-test {

  padding: 13px 15px;

  margin-bottom: 9px;

  border-radius: 10px;

  background:
    #fff9e8;

  font-size: 15px;

  font-weight: 600;

}


.flaky-number {

  display: inline-flex;

  align-items: center;

  justify-content: center;

  width: 27px;

  height: 27px;

  margin-right: 8px;

  border-radius: 50%;

  background:
    #ffb31a;

  color:
    white;

  font-size: 13px;

}


/* =====================================================
   BUTTONS
===================================================== */

.actions {

  display: flex;

  justify-content: center;

  gap: 15px;

  flex-wrap: wrap;

  margin-top: 25px;

}


.button {

  display: inline-flex;

  align-items: center;

  gap: 9px;

  padding: 14px 24px;

  border-radius: 11px;

  text-decoration: none;

  font-size: 15px;

  font-weight: 800;

  transition:
    .2s ease;

}


.button-primary {

  background:
    #0969b0;

  color:
    white;

}


.button-primary:hover {

  transform:
    translateY(-2px);

  background:
    #07548c;

}


.button-secondary {

  background:
    #eaf3ff;

  color:
    #0969b0;

}


.button-secondary:hover {

  transform:
    translateY(-2px);

  background:
    #dcecff;

}


/* =====================================================
   FOOTER
===================================================== */

.footer {

  margin-top: 30px;

  padding: 28px 35px;

  border-radius:
    20px;

  display: flex;

  align-items: center;

  justify-content: space-between;

  background:
    linear-gradient(
      135deg,
      #102d59,
      #315b91
    );

  color:
    white;

}


.footer-brand {

  display: flex;

  align-items: center;

  gap: 20px;

}


.footer-logo {

  width: 125px;

  max-height: 50px;

  object-fit: contain;

}


.footer-divider {

  width: 1px;

  height: 45px;

  background:
    rgba(
      255,
      255,
      255,
      .45
    );

}


.footer-title {

  font-size: 18px;

  font-weight: 800;

}


.footer-subtitle {

  margin-top: 5px;

  color:
    #d9e4f2;

  font-size: 14px;

}


.footer-right {

  text-align: right;

  font-size: 14px;

  line-height: 1.5;

  color:
    #dce6f2;

}


/* =====================================================
   MOBILE
===================================================== */

@media (
  max-width: 1100px
) {

  .dashboard {

    grid-template-columns:
      1fr;

  }

  .header {

    flex-direction:
      column;

    align-items:
      flex-start;

  }

  .execution {

    width:
      100%;

  }

}


@media (
  max-width: 700px
) {

  .container {

    padding:
      15px;

  }

  .brand {

    gap:
      15px;

  }

  .logo {

    width:
      130px;

  }

  .title h1 {

    font-size:
      30px;

  }

  .title h2 {

    font-size:
      23px;

  }

  .header-divider {

    display:
      none;

  }

  .donut {

    width:
      270px;

    height:
      270px;

  }

  .donut::before {

    width:
      175px;

    height:
      175px;

  }

  .donut-number {

    font-size:
      48px;

  }

  .legend {

    gap:
      14px;

  }

  .status-card {

    flex-direction:
      column;

    align-items:
      flex-start;

  }

  .quote {

    border-left:
      none;

    border-top:
      1px solid #b9c5d5;

    padding:
      20px 0 0;

    max-width:
      100%;

  }

  .footer {

    flex-direction:
      column;

    align-items:
      flex-start;

    gap:
      20px;

  }

  .footer-right {

    text-align:
      left;

  }

}

</style>

</head>


<body>


<div class="container">


<!-- ==================================================
     HEADER
================================================== -->

<header class="header">


  <div class="brand">

    ${logoHtml}


    <div class="header-divider"></div>


    <div class="title">

      <h1>
        Test Automation Report
      </h1>

      <h2>
        Web Desktop
      </h2>

      <div class="tagline">
        Quality Today&nbsp;&nbsp; | &nbsp;&nbsp;A Better Tomorrow
      </div>

    </div>

  </div>


  <div class="execution">

    <div class="execution-icon">
      📅
    </div>

    <div>

      <div class="execution-label">
        Execution Date
      </div>

      <div class="execution-date">
        ${executionDate}
      </div>

      <div class="execution-time">
        ${executionTime} WIB
      </div>

    </div>

  </div>


</header>


<!-- ==================================================
     DASHBOARD
================================================== -->

<div class="dashboard">


<!-- ==================================================
     INFORMATION
================================================== -->

<div class="card info-card">


  <div class="info-row">

    <div class="info-icon">
      👤
    </div>

    <div>

      <div class="info-label">
        Executed By
      </div>

      <div class="info-value">
        ${escapeHtml(QC_NAME)}
      </div>

    </div>

  </div>


  <div class="info-row">

    <div class="info-icon">
      🌐
    </div>

    <div>

      <div class="info-label">
        Browser
      </div>

      <div class="info-value">
        ${escapeHtml(BROWSER)}
      </div>

    </div>

  </div>


  <div class="info-row">

    <div class="info-icon">
      ⏱
    </div>

    <div>

      <div class="info-label">
        Duration
      </div>

      <div class="info-value">
        ${durationMinutes} minutes
      </div>

    </div>

  </div>


  <div class="info-row">

    <div class="info-icon">
      🧪
    </div>

    <div>

      <div class="info-label">
        Total Tests
      </div>

      <div class="info-value">
        ${total}
      </div>

    </div>

  </div>


  <div class="info-row">

    <div class="info-icon">
      🔗
    </div>

    <div>

      <div class="info-label">
        Application
      </div>

      <div class="info-value">
        RCTI+
      </div>

    </div>

  </div>


</div>


<!-- ==================================================
     DONUT
================================================== -->

<div class="card chart-card">


  <div class="donut">

    <div class="donut-content">

      <div class="donut-number">
        ${total}
      </div>

      <div class="donut-label">
        Total Tests
      </div>

      <div class="donut-rate">
        ${passRate}% Pass Rate
      </div>

    </div>

  </div>


  <div class="legend">


    <div class="legend-item">

      <div class="legend-title">

        <span class="dot dot-green"></span>

        Passed

      </div>

      <div class="legend-value">
        ${passed}
      </div>

    </div>


    <div class="legend-item">

      <div class="legend-title">

        <span class="dot dot-red"></span>

        Failed

      </div>

      <div class="legend-value">
        ${failed}
      </div>

    </div>


    <div class="legend-item">

      <div class="legend-title">

        <span class="dot dot-yellow"></span>

        Flaky

      </div>

      <div class="legend-value">
        ${flaky}
      </div>

    </div>


  </div>


</div>


<!-- ==================================================
     KPI
================================================== -->

<div class="kpi-stack">


  <div class="kpi passed">

    <div class="kpi-left">

      <div class="kpi-icon">
        ✓
      </div>

      <div>

        <div class="kpi-title">
          Passed
        </div>

        <div class="kpi-number">
          ${passed}
        </div>

      </div>

    </div>


    <div>

      <div class="kpi-percent">
        ${passRate}%
      </div>

      <div class="kpi-rate-label">
        Pass Rate
      </div>

    </div>

  </div>


  <div class="kpi failed">

    <div class="kpi-left">

      <div class="kpi-icon">
        ×
      </div>

      <div>

        <div class="kpi-title">
          Failed
        </div>

        <div class="kpi-number">
          ${failed}
        </div>

      </div>

    </div>


    <div>

      <div class="kpi-percent">
        ${failureRate}%
      </div>

      <div class="kpi-rate-label">
        Failure Rate
      </div>

    </div>

  </div>


  <div class="kpi flaky">

    <div class="kpi-left">

      <div class="kpi-icon">
        ~
      </div>

      <div>

        <div class="kpi-title">
          Flaky
        </div>

        <div class="kpi-number">
          ${flaky}
        </div>

      </div>

    </div>


    <div>

      <div class="kpi-percent">
        ${flakyRate}%
      </div>

      <div class="kpi-rate-label">
        Flaky Rate
      </div>

    </div>

  </div>


</div>


</div>


<!-- ==================================================
     STATUS
================================================== -->

<div class="status-card ${statusClass}">


  <div class="status-left">


    <div class="status-icon">
      ${statusIcon}
    </div>


    <div>

      <h2 class="status-title">
        ${statusTitle}
      </h2>

      <div class="status-message">
        ${statusMessage}
      </div>

      <div class="status-description">

        Application:
        ${escapeHtml(BASE_URL)}

      </div>

    </div>


  </div>


  <div class="quote">

    "Quality is not an act,
    it is a habit."

    <div class="quote-author">
      — Quality Assurance
    </div>

  </div>


</div>


<!-- ==================================================
     FAILED
================================================== -->

${failedHtml}


<!-- ==================================================
     FLAKY
================================================== -->

${flakyHtml}


<!-- ==================================================
     SKIPPED
================================================== -->

${skippedHtml}


<!-- ==================================================
     BUTTONS
================================================== -->

<div class="actions">


  <a
    href="./playwright-report/index.html"
    class="button button-primary"
  >
    📊 View Detailed Playwright Report
  </a>


  <a
    href="${BASE_URL}"
    target="_blank"
    rel="noopener noreferrer"
    class="button button-secondary"
  >
    🌐 Open RCTI+
  </a>


</div>


<!-- ==================================================
     FOOTER
================================================== -->

<footer class="footer">


  <div class="footer-brand">

    ${logoHtml}

    <div class="footer-divider"></div>

    <div>

      <div class="footer-title">
        Quality Assurance Team
      </div>

      <div class="footer-subtitle">
        Automate&nbsp;&nbsp;•&nbsp;&nbsp;
        Validate&nbsp;&nbsp;•&nbsp;&nbsp;
        Deliver&nbsp;&nbsp;•&nbsp;&nbsp;
        Together
      </div>

    </div>

  </div>


  <div class="footer-right">

    RCTI+<br>

    Test Automation

  </div>


</footer>


</div>


</body>

</html>
`;


// ======================================================
// WRITE FILE
// ======================================================

try {

  fs.writeFileSync(
    CUSTOM_REPORT,
    html,
    'utf8'
  );

} catch (error) {

  console.error(
    '❌ Gagal membuat custom report:'
  );

  console.error(error.message);

  process.exit(1);

}


// ======================================================
// RESULT
// ======================================================

console.log('');
console.log('==============================================');
console.log('       ✅ CUSTOM REPORT GENERATED');
console.log('==============================================');
console.log('');

console.log(
  `📄 Report : ${CUSTOM_REPORT}`
);

console.log(
  `🧪 Total  : ${total}`
);

console.log(
  `✅ Passed : ${passed}`
);

console.log(
  `❌ Failed : ${failed}`
);

console.log(
  `🟡 Flaky  : ${flaky}`
);

console.log(
  `⏭ Skipped: ${skipped}`
);

console.log(
  `📈 Pass   : ${passRate}%`
);

console.log(
  `⏱ Duration: ${durationMinutes} min`
);

console.log('');

console.log(
  '🌐 Custom report berhasil dibuat.'
);

console.log('');

console.log(
  'Buka dengan:'
);

console.log('');

console.log(
  'open custom-report.html'
);

console.log('');