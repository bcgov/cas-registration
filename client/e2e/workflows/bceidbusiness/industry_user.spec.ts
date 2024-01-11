// 🧪 Suite to test the bceidbusiness industry_user workflow

import { test, expect } from "@playwright/test";

import * as dotenv from "dotenv";
dotenv.config({
  path: "@/e2e/.env.local",
});

// ⛏️ Helpers
import { navigateAndWaitForLoad } from "@/e2e/utils/helpers";

// set the test url
const url = process.env.BASEURL || "";

// 🏷 Annotate test suite as serial
test.describe.configure({ mode: "serial" });

test.describe("Test Workflow industry_user", () => {
  // 👤 run test as `industry_user` role
  const storageState = process.env.INDUSTRY_USER_STORAGE;
  test.use({ storageState: storageState });
  test("Test Redirect to Dashboard", async ({ page }) => {
    await navigateAndWaitForLoad(page, url);
    // 🔍 Assert that the current URL ends with "/profile"
    expect(page.url().toLocaleLowerCase()).toContain("/dashboard");
    // 🚩 Dashboard page test @ `client/e2e/pages/authenticated/dashboard/page.spec.ts`
  });
});
