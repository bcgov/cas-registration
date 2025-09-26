import { setupBeforeAllTest } from "@bciers/e2e/setupBeforeAll";
import { UserRole } from "@bciers/e2e/utils/enums";
import {
  analyzeAccessibility,
  takeStabilizedScreenshot,
} from "@bciers/e2e/utils/helpers";
import { DashboardPOM } from "@/dashboard-e2e/poms/dashboard";
import { upsertUserOperatorRecord } from "@bciers/e2e/utils/queries";
import { linkIsVisible } from "@bciers/e2e/utils/helpers";

const happoPlaywright = require("happo-playwright");

const userRoles = [
  "INDUSTRY_USER_ADMIN",
  "INDUSTRY_USER_REPORTER",
  "INDUSTRY_USER",
];

const test = setupBeforeAllTest(UserRole.INDUSTRY_USER_ADMIN);
test.describe.configure({ mode: "serial" });
userRoles.forEach((role) => {
  test.describe("External user dashboard", () => {
    test(`Dashboard for role: ${role}`, async ({ page }) => {
      if (role === "INDUSTRY_USER_REPORTER") {
        // Update the role to reporter in the DB since we do not have this set up
        const userId = process.env.E2E_INDUSTRY_USER_ADMIN_GUID as string;
        await upsertUserOperatorRecord(userId, "reporter", "Approved");
      } else if (role === "INDUSTRY_USER") {
        const userId = process.env.E2E_INDUSTRY_USER_ADMIN_GUID as string;
        await upsertUserOperatorRecord(userId, "pending", "Pending");
      }

      // 🛸 Navigate to dashboard page
      const dashboardPage = new DashboardPOM(page);
      await dashboardPage.route();
      let component = "";

      // Say cheese!
      component = `Main Dashboard for ${role}`;
      await takeStabilizedScreenshot(happoPlaywright, page, {
        component: component,
        variant: "default",
      });
      await analyzeAccessibility(page);
    });
  });
});
