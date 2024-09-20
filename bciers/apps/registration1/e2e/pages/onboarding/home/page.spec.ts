// 🧪 Suite to test `bciers/apps/registration1/app/(onboarding)/home/page.tsx`
import { test } from "@playwright/test";
// 🪄 Page Object Models
import { HomePOM } from "@/e2e/poms/home";
// ☰ Enums
import { AppRole, UserRole, UserOperatorStatus } from "@/e2e/utils/enums";
// 🥞 DB CRUD
import {
  deleteUserRecord,
  upsertUserRecord,
  upsertOperatorRecord,
  upsertUserOperatorRecord,
} from "@/e2e/utils/queries";
// ℹ️ Environment variables
import * as dotenv from "dotenv";
dotenv.config({ path: "./e2e/.env.local" });
import happoPlaywright from "happo-playwright";
// Helpers
import { analyzeAccessibility } from "@/e2e/utils/helpers";

// 🏷 Annotate test suite as serial
test.describe.configure({ mode: "serial" });

// 📚 Declare a beforeAll hook that is executed once per worker process before all tests.
// 🥞 Set DB for e2e login roles
/*
For industry_user_admin: set up for user login to have app_role "industry_user_admin"
- create user
- create operator
- create user operator
For industry_user: set up for user login to have app_role "industry_user"
- create user
For "new user":
-  delete record in the db so that on "new user" login the ID will have no app_role
*/
test.beforeAll(async () => {
  try {
    // 👤 industry_user_admin
    // Upsert a User record: bc-cas-dev
    await upsertUserRecord(UserRole.INDUSTRY_USER_ADMIN);
    // Upsert an Operator record, using default values
    await upsertOperatorRecord();
    // Upsert an User Operator record: industry_user_admin, operator id 2
    await upsertUserOperatorRecord(
      process.env.E2E_INDUSTRY_USER_ADMIN_GUID as string,
      AppRole.ADMIN,
      UserOperatorStatus.APPROVED,
    );

    // 👤 industry_user
    // Upsert a User record: bc-cas-dev-secondary
    await upsertUserRecord(UserRole.INDUSTRY_USER);

    // 👤 delete new user: bc-cas-dev-three
    await deleteUserRecord(process.env.E2E_NEW_USER_GUID as string);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("❌ Error in Db setup for login roles:", error);
    throw error;
  }
});

test.beforeEach(async ({ context }) => {
  await happoPlaywright.init(context);
});

test.afterEach(async () => {
  await happoPlaywright.finish();
});

test.describe("Test Page - Home", () => {
  test("Test Route", async ({ page }) => {
    const homePage = new HomePOM(page);
    await homePage.route();
    const currentUrl = await page.url();
    await expect(currentUrl.toLocaleLowerCase()).toContain("fake-error");
    // 🔍 Assert correct url
    homePage.urlIsCorrect();
  });

  test("Test Selfie", async ({ page }) => {
    const homePage = new HomePOM(page);
    await homePage.route();

    const pageContent = page.locator("html");

    await happoPlaywright.screenshot(homePage.page, pageContent, {
      component: "Home page",
      variant: "default",
    });
    // ♿️ Analyze accessibility
    await analyzeAccessibility(page);
  });
});
