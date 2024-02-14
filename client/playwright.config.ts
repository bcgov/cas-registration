import { defineConfig, devices } from "@playwright/test";
// 👌 Best Practice:
// prefer user-facing attributes to XPath or CSS selectors
// this verifies that the application code works for the end users
// find locators using codegen to record user actions, e.g.: npx playwright codegen http://localhost:3000

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require("dotenv").config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./e2e",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "html",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://127.0.0.1:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
  },
  // 🚩 The globalSetup option in playwright.config.js allows you to specify a JavaScript file that will be executed ONCE before all test suites.
  globalSetup: require.resolve("e2e/setup/global.ts"),

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: [
  //   {
  //     command: "yarn build && yarn start",
  //     url: "http://localhost:3000",
  //     reuseExistingServer: true,
  //   },
  //   {
  //     command: "make run",
  //     cwd: "../bc_obps",
  //     url: "http://127.0.0.1:8000/api/docs",
  //     reuseExistingServer: true,
  //   },
  // ],
});
