// 🧪 Suite to test the cas_analyst workflow

import { test, expect } from "@playwright/test";

import * as dotenv from "dotenv";
dotenv.config({
  path: "@/e2e/.env.local",
});

// ⛏️ Helpers
import { navigateAndWaitForLoad } from "@/e2e/utils/helpers";

// Access the baseURL made available to proces.env from `client/e2e/setup/global.ts`
const { BASEURL } = process.env;
// set the test url
const url = BASEURL || "";

// 🏷 Annotate test suite as serial
test.describe.configure({ mode: "serial" });

test.describe("Test Workflow cas_analyst", () => {
  // 👤 run test `cas_analyst` role
  const storageState = process.env.CAS_ANALYST_STORAGE;
  test.use({ storageState: storageState });
  test("Test Redirect to Dashboard", async ({ page }) => {
    await navigateAndWaitForLoad(page, url);
    // 🔍 Assert that the current URL ends with "/profile"
    expect(page.url().toLocaleLowerCase()).toContain("/dashboard");
    // 🚩 Dashboard page test @ `client/e2e/pages/authenticated/dashboard/page.spec.ts`
  });
});
