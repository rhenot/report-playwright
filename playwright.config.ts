import {
  defineConfig,
  devices
} from '@playwright/test';

export default defineConfig({

  // ==================================================
  // TEST DIRECTORY
  // ==================================================

  testDir: './tests',

  // ==================================================
  // TEST FILE
  // ==================================================

  testMatch: '**/*.{spec,specs,test}.{ts,js}',

  // ==================================================
  // TIMEOUT
  // ==================================================

  timeout: 60000,

  expect: {
    timeout: 10000,
  },

  // ==================================================
  // EXECUTION
  // ==================================================

  fullyParallel: true,

  retries: 1,

  workers: undefined,

  // ==================================================
  // REPORTER
  // ==================================================

  reporter: [

    [
      'html',
      {
        outputFolder: 'playwright-report',
        open: 'never',
      },
    ],

    [
      'json',
      {
        outputFile:
          'test-results/playwright-report.json',
      },
    ],

  ],

  // ==================================================
  // GLOBAL USE
  // ==================================================

  use: {

    baseURL:
      'https://www.rctiplus.com',

    headless: true,

    screenshot: 'only-on-failure',

    video: 'retain-on-failure',

    trace: 'retain-on-failure',

    actionTimeout: 15000,

  },

  // ==================================================
  // PROJECTS
  // ==================================================

  projects: [

    // -----------------------------------------------
    // DESKTOP CHROME
    // -----------------------------------------------

    {
      name: 'chrome',

      use: {
        ...devices['Desktop Chrome'],
      },
    },

    // -----------------------------------------------
    // DESKTOP FIREFOX
    // -----------------------------------------------

    {
      name: 'firefox',

      use: {
        ...devices['Desktop Firefox'],
      },
    },

    // -----------------------------------------------
    // DESKTOP SAFARI
    // -----------------------------------------------

    {
      name: 'safari',

      use: {
        ...devices['Desktop Safari'],
      },
    },

    // -----------------------------------------------
    // MOBILE CHROME - PIXEL 7
    // -----------------------------------------------

    {
      name: 'mobile-chrome',

      use: {

        ...devices['Pixel 7'],

        baseURL:
          'https://m.rctiplus.com',

      },
    },

    // -----------------------------------------------
    // MOBILE IPHONE 15 PRO
    // -----------------------------------------------

    {
      name: 'mobile-iphone-15-pro',

      use: {

        ...devices['iPhone 15 Pro'],

        baseURL:
          'https://m.rctiplus.com',

      },
    },

    // -----------------------------------------------
    // MOBILE IPHONE SE
    // -----------------------------------------------

    {
      name: 'mobile-iphone-se',

      use: {

        ...devices['iPhone SE'],

        baseURL:
          'https://m.rctiplus.com',

      },
    },

    // -----------------------------------------------
    // GALAXY S24
    // -----------------------------------------------

    {
      name: 'mobile-galaxy-s24',

      use: {

        ...devices['Galaxy S24'],

        baseURL:
          'https://m.rctiplus.com',

      },
    },

    // -----------------------------------------------
    // GALAXY Z FOLD 7
    // -----------------------------------------------

    {
      name: 'mobile-galaxy-z-fold7',

      use: {

        ...devices['Galaxy Z Fold 7'],

        baseURL:
          'https://m.rctiplus.com',

      },
    },

    // -----------------------------------------------
    // PIXEL 9 PRO
    // -----------------------------------------------

    {
      name: 'mobile-pixel-9-pro',

      use: {

        ...devices['Pixel 9 Pro'],

        baseURL:
          'https://m.rctiplus.com',

      },
    },

    // -----------------------------------------------
    // IPAD PRO 11
    // -----------------------------------------------

    {
      name: 'tablet-ipad-pro',

      use: {

        ...devices['iPad Pro 11'],

        baseURL:
          'https://www.rctiplus.com',

      },
    },

    // -----------------------------------------------
    // GALAXY TAB S9
    // -----------------------------------------------

    {
      name: 'tablet-galaxy-tab-s9',

      use: {

        ...devices['Galaxy Tab S9'],

        baseURL:
          'https://www.rctiplus.com',

      },
    },

    // -----------------------------------------------
    // IPHONE 17
    // -----------------------------------------------

    {
      name: 'mobile-iphone-17',

      use: {

        ...devices['iPhone 17'],

        baseURL:
          'https://m.rctiplus.com',

      },
    },

    // -----------------------------------------------
    // MOBILE SAFARI
    // -----------------------------------------------

    {
      name: 'mobile-safari-iphone',

      use: {

        ...devices['iPhone 15 Pro'],

        browserName: 'webkit',

        baseURL:
          'https://m.rctiplus.com',

      },
    },

  ],

});