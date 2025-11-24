import { expect } from "@playwright/test";
import { setupBeforeAllTest } from "@bciers/e2e/setupBeforeAll";
import { UserRole } from "@bciers/e2e/utils/enums";
import {
  analyzeAccessibility,
  takeStabilizedScreenshot,
  linkIsVisible,
} from "@bciers/e2e/utils/helpers";
import { DashboardPOM } from "@/dashboard-e2e/poms/dashboard";
import { upsertUserOperatorRecord } from "@bciers/e2e/utils/queries";
import {
  DashboardTiles,
  ExternalDashboardLinks,
  ExternalDashboardTiles,
} from "@/dashboard-e2e/utils/enums";

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

      for (const linkToCheck of Object.values(ExternalDashboardLinks)) {
        if (role === "INDUSTRY_USER_ADMIN") {
          if (linkToCheck === ExternalDashboardLinks.SELECT_OPERATOR)
            await linkIsVisible(page, linkToCheck, false, true);
          else await linkIsVisible(page, linkToCheck, true, true);
        } else if (role === "INDUSTRY_USER_REPORTER") {
          if (
            linkToCheck === ExternalDashboardLinks.USERS_AND_ACCESS_REQUESTS ||
            linkToCheck === ExternalDashboardLinks.SELECT_OPERATOR
          )
            await linkIsVisible(page, linkToCheck, false, true);
          else await linkIsVisible(page, linkToCheck, true, true);
        } else {
          if (
            linkToCheck === ExternalDashboardLinks.SELECT_OPERATOR ||
            linkToCheck === ExternalDashboardLinks.REPORT_PROBLEM ||
            linkToCheck === ExternalDashboardLinks.VIEW_ANNUAL_REPORTS ||
            linkToCheck === ExternalDashboardLinks.VIEW_PAST_REPORTS
          )
            await linkIsVisible(page, linkToCheck, true, true);
          else await linkIsVisible(page, linkToCheck, false, true);
        }
      }
      for (const tile of ExternalDashboardTiles) {
        const tileText = page.getByRole("heading", { name: tile, exact: true });
        if (role === "INDUSTRY_USER") {
          if (
            tile === DashboardTiles.ADMINISTRATION ||
            tile === DashboardTiles.REPORTING ||
            tile === DashboardTiles.REPORT_A_PROBLEM
          ) {
            await expect(tileText).toBeVisible();
          } else await expect(tileText).toBeHidden();
        } else await expect(tileText).toBeVisible();
      }
    });
  });
});
