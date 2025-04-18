import { test } from "@playwright/test";
// ☰ Enums
import { UserRole } from "@bciers/e2e/utils/enums";
// 🛠️ Helpers
import { setupTestEnvironment } from "@bciers/e2e/utils/helpers";
// ℹ️ Environment variables
import * as dotenv from "dotenv";

dotenv.config({ path: "./e2e/.env.local" });

const happoPlaywright = require("happo-playwright");

// NOTE:: This is just a quick basic test setup to ensure that the database and auth are working in CI
// Feel free to delete this or modify it as needed

const testNxProjectLandingPage = async (zones: string[]) => {
  test.beforeAll(async () => {
    // Note: can run multiple times if using multiple workers (or, if a test fails you'll get a new worker- can't be helped)
    // So, ensure this runs only once by using only 1 worker
    // Setup fixtures for admin-industry_user
    await setupTestEnvironment();
  });

  test.beforeEach(async ({ context }) => {
    await happoPlaywright.init(context);
  });

  test.afterEach(async () => {
    await happoPlaywright.finish();
  });

  // 🏷 Annotate test suite as serial
  test.describe.configure({ mode: "serial" });
  zones.forEach((zone) => {
    test.describe(`Test ${zone} landing page`, () => {
      const url = `${process.env.E2E_BASEURL}${zone}`;
      // Reporting dashboard is broken at the moment
      const user =
        zone === "reporting"
          ? UserRole.CAS_ADMIN
          : UserRole.INDUSTRY_USER_ADMIN;
      const testRole = `E2E_${user.toUpperCase()}_STORAGE_STATE`;

      const storageState = JSON.parse(process.env[testRole] as string);

      test.use({ storageState: storageState });

      test("Test Selfie", async ({ page }) => {
        // 🛸 Navigate to landing page
        await page.goto(url);

        // ⏲️ Add a delay (in milliseconds) to wait before taking the screenshot
        await page.waitForTimeout(5000); // Wait for 5 seconds

        // 📷 Cheese!
        const pageContent = page.locator("html");
        await happoPlaywright.screenshot(page, pageContent, {
          component: `Authenticated ${zone} page - ${user}`,
          variant: "default",
        });
      });
    });
  });
};

export default testNxProjectLandingPage;
