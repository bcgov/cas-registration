// 🧪 Suite to test accessibility
import { expect, test, APIResponse } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
// 🪄 Page Object Models
import { DashboardPOM } from "@/e2e/poms/dashboard";
import { HomePOM } from "@/e2e/poms/home";
import { ProfilePOM } from "@/e2e/poms/profile";
import { OperationPOM } from "@/e2e/poms/operation";
import { OperationsPOM } from "@/e2e/poms/operations";
import { OperatorPOM } from "@/e2e/poms/operator";
import { UsersPOM } from "@/e2e/poms/users";
// ☰ Enums

import * as dotenv from "dotenv";
dotenv.config({ path: "./e2e/.env.local" });

test.beforeEach(async ({ context }) => {
  let response: APIResponse = await context.request.get(
    "http://localhost:8000/api/registration/test-setup",
  );
  // Wait for the response and check for success status text and code (e.g., 200)
  expect(await response.text()).toBe("Test setup complete.");
  expect(response.status()).toBe(200);
});

// 🏷 Annotate test suite as serial
test.describe.configure({ mode: "serial" });
test.describe("Axe industry_user_admin accessibility tests", () => {
  // 👤 run test using the storageState for this role
  const storageState = JSON.parse(
    process.env.E2E_INDUSTRY_USER_ADMIN_STORAGE as string,
  );
  // Note: specify storageState for each test file or test group, instead of setting it in the config. https://playwright.dev/docs/next/auth#reuse-signed-in-state
  test.use({ storageState: storageState }); // this will error if no such file or directory

  test("Dashboard page accessibility test", async ({ page }) => {
    const dashboardPage = new DashboardPOM(page);
    await dashboardPage.route();

    await dashboardPage.urlIsCorrect();

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("Profile page accessibility test", async ({ page }) => {
    const profilePage = new ProfilePOM(page);
    await profilePage.route();

    await profilePage.urlIsCorrect();

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
