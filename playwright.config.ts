import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',

  testMatch: /.*\.specs?\.(ts|js)/,

  timeout: 60000,

  expect: {
    timeout: 10000,
  },

  fullyParallel: true,

  retries: 1,

  reporter: [
    ['html', {
      outputFolder: 'playwright-report',
      open: 'never'
    }],
    ['list']
  ],

  use: {
    baseURL: 'https://www.rctiplus.com',
    headless: true,

    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',

    actionTimeout: 15000,
  },

  projects: [
    {
      name: 'chrome',
      use: {
        ...devices['Desktop Chrome'],
      },
    },

    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
      },
    },

    {
      name: 'safari',
      use: {
        ...devices['Desktop Safari'],
      },
    },

    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 7'],
        baseURL: 'https://m.rctiplus.com',
      },
    },

    {
      name: 'mobile-iphone-15-pro',
      use: {
        ...devices['iPhone 15 Pro'],
        baseURL: 'https://m.rctiplus.com',
      },
    },

    {
      name: 'mobile-iphone-se',
      use: {
        ...devices['iPhone SE'],
        baseURL: 'https://m.rctiplus.com',
      },
    },

    {
      name: 'mobile-galaxy-s24',
      use: {
        ...devices['Galaxy S24'],
        baseURL: 'https://m.rctiplus.com',
      },
    },

    {
      name: 'mobile-galaxy-z-fold7',
      use: {
        ...devices['Galaxy Z Fold 7'],
        baseURL: 'https://m.rctiplus.com',
      },
    },

    {
      name: 'mobile-pixel-9-pro',
      use: {
        ...devices['Pixel 9 Pro'],
        baseURL: 'https://m.rctiplus.com',
      },
    },

    {
      name: 'tablet-ipad-pro',
      use: {
        ...devices['iPad Pro 11'],
        baseURL: 'https://www.rctiplus.com',
      },
    },

    {
      name: 'tablet-galaxy-tab-s9',
      use: {
        ...devices['Galaxy Tab S9'],
        baseURL: 'https://www.rctiplus.com',
      },
    },

    {
      name: 'mobile-iphone-17',
      use: {
        ...devices['iPhone 17'],
        baseURL: 'https://m.rctiplus.com',
      },
    },

    {
      name: 'mobile-safari-iphone',
      use: {
        ...devices['iPhone 15 Pro'],
        baseURL: 'https://m.rctiplus.com',
        browserName: 'webkit',
      },
    },
  ],
});