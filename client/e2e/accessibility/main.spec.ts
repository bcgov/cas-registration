// 🧪 Suite to test accessibility
import { expect, test, APIResponse } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
// 🪄 Page Object Models
import { DashboardPOM } from "@/e2e/poms/dashboard";
import { HomePOM } from "@/e2e/poms/home";
import { ProfilePOM } from "@/e2e/poms/profile";
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
test.describe("Axe unauthenticated accessibility test", () => {
  test.use({}); // this will error if no such file or directory

  test("Landing page accessibility test", async ({ page }) => {
    const homePage = new HomePOM(page);
    await homePage.route();

    await homePage.urlIsCorrect();

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
