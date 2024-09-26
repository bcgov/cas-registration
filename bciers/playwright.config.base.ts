import { devices } from "@playwright/test";
import { nxE2EPreset } from "@nx/playwright/preset";

// For CI, you may want to set BASE_URL to the deployed application.
const baseURL = process.env.BASE_URL || "http://localhost:3000";

const playwrightBaseConfig = {
  ...nxE2EPreset(__filename, { testDir: "./tests" }),

  // Increase timeout from default to acomadate for slower CI
  timeout: 60000, //Each test is given 60 seconds timeout
  testDir: "./tests",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI ? "blob" : "html",
  use: {
    baseURL: baseURL,
    trace: "on", // 'on' will capture trace for every test
    // Other options
    // "off"  // Default off
    // "retain-on-failure", // Record trace only on test failure
    // 'on-first-retry', // Record trace only on the first retry.
  },
  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
    // {
    //   name: "firefox",
    //   use: { ...devices["Desktop Firefox"] },
    // },
    // {
    //   name: "webkit",
    //   use: { ...devices["Desktop Safari"] },
    // },
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
};

export default playwrightBaseConfig;
