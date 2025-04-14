import { test } from "@playwright/test";
// import { analyzeAccessibility } from "@/e2e/utils/helpers";
// ☰ Enums
import { AppRole, UserRole, UserOperatorStatus } from "@bciers/e2e/utils/enums";
// 🥞 DB CRUD
import {
  deleteUserOperatorRecord,
  upsertUserRecord,
  upsertOperatorRecord,
  upsertUserOperatorRecord,
} from "@bciers/e2e/utils/queries";
// ℹ️ Environment variables
import * as dotenv from "dotenv";
dotenv.config({ path: "./e2e/.env.local" });

const happoPlaywright = require("happo-playwright");
test.beforeAll(async () => {
  try {
    // Scenario FrontEndRoles.INDUSTRY_USER_ADMIN where UserOperatorStatus.APPROVED && OperatorStatus.APPROVED;
    // Upsert a User record: bc-cas-dev
    await upsertUserRecord(UserRole.INDUSTRY_USER_ADMIN);
    await upsertUserRecord(UserRole.CAS_ADMIN);
    // Upsert an Operator record, using default values
    await upsertOperatorRecord();
    // Upsert an User Operator record: industry_user_admin, operator id 2
    await upsertUserOperatorRecord(
      process.env.E2E_INDUSTRY_USER_ADMIN_GUID as string,
      AppRole.ADMIN,
      UserOperatorStatus.APPROVED,
    );
    // Scenario FrontEndRoles.INDUSTRY_USER where userOperatorStatus !== UserOperatorStatus.APPROVED
    // Shows "Select Operator\...1 pending action(s) required" bceidSelectOperatorTile
    // ensure user is not associated with any operator
    // Upsert a User record: bc-cas-dev-secondary
    await upsertUserRecord(UserRole.INDUSTRY_USER);
    await deleteUserOperatorRecord(
      process.env.E2E_INDUSTRY_USER_GUID as string,
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("❌ Error in Db setup for dashboard:", error);
    throw error;
  }
});

test.beforeEach(async ({ context }) => {
  await happoPlaywright.init(context);
});

test.afterEach(async () => {
  await happoPlaywright.finish();
});
// 🏷 Annotate test suite as serial to prevent failure in setupTestEnvironment
test.describe.configure({ mode: "serial" });
const zones = [
  "administration",
  "coam",
  "dashboard",
  "registration",
  "reporting",
];
zones.forEach((zone) => {
  test.describe(`Test BCIERS Dashboard: ${zone}`, () => {
    const url = `${process.env.E2E_BASEURL}${zone}`;
    // Reporting dashboard is broken at the moment
    const user =
      zone === "reporting" ? UserRole.CAS_ADMIN : UserRole.INDUSTRY_USER_ADMIN;
    const testRole = `E2E_${user.toUpperCase()}_STORAGE_STATE`;

    const storageState = JSON.parse(process.env[testRole] as string);

    test.use({ storageState: storageState });

    test("Test Selfie", async ({ page }) => {
      // 🛸 Navigate to landing page
      await page.goto(url);

      // 📷 Cheese!
      const pageContent = page.locator("html");
      await happoPlaywright.screenshot(page, pageContent, {
        component: `Authenticated ${zone} page - ${user}`,
        variant: "default",
      });
    });
  });
});
