import { test } from "@playwright/test";
// import { analyzeAccessibility } from "@/e2e/utils/helpers";
// ☰ Enums
import { AppRole, UserRole, UserOperatorStatus } from "@/e2e/utils/enums";
// 🥞 DB CRUD
import {
  deleteUserOperatorRecord,
  upsertUserRecord,
  upsertOperatorRecord,
  upsertUserOperatorRecord,
} from "@/e2e/utils/queries";
// ℹ️ Environment variables
import * as dotenv from "dotenv";
dotenv.config({ path: "./e2e/.env.local" });

const happoPlaywright = require("happo-playwright");

// NOTE:: This is just a quick basic test setup to ensure that the database and auth are working in CI
// Feel free to delete this or modify it as needed

const testNxProjectLandingPage = async (zone: string, userRole?: string) => {
  test.beforeAll(async () => {
    try {
      // Scenario FrontEndRoles.INDUSTRY_USER_ADMIN where UserOperatorStatus.APPROVED && OperatorStatus.APPROVED;
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

  const url = `${process.env.E2E_BASEURL}${zone}`;
  const user = userRole ?? UserRole.INDUSTRY_USER_ADMIN;
  const testRole = `E2E_${user.toUpperCase()}_STORAGE_STATE`;
  // 🏷 Annotate test suite as serial
  test.describe.configure({ mode: "serial" });
  test.describe(`Test ${zone} landing page`, () => {
    const storageState = JSON.parse(process.env[testRole] as string);

    test.use({ storageState: storageState });

    test("Test Selfie", async ({ page }) => {
      // 🛸 Navigate to landing page
      await page.goto(url);

      // 📷 Cheese!
      const pageContent = page.locator("html");
      await happoPlaywright.screenshot(page, pageContent, {
        component: `Authenticated ${zone} page industry_user_admin`,
        variant: "default",
      });
    });
  });
};

export default testNxProjectLandingPage;
