import { test, expect } from "@playwright/test";
import { setupBeforeAllTest } from "@bciers/e2e/setupBeforeAll";
import { UserRole, LinkSrc } from "@bciers/e2e/utils/enums";
import {
  analyzeAccessibility,
  takeStabilizedScreenshot,
} from "@bciers/e2e/utils/helpers";
import { DashboardPOM } from "@/dashboard-e2e/poms/dashboard";
import {
  DashboardTiles,
  AdministrationTileText,
  ReportingTileText,
  ComplianceTileText,
  RegistrationTileText,
  AccessRequestText,
} from "@/dashboard-e2e/utils/enums";
import { upsertUserOperatorRecord } from "@bciers/e2e/utils/queries";

const happoPlaywright = require("happo-playwright");

const userRoles = ["INDUSTRY_USER_ADMIN", "INDUSTRY_USER_REPORTER"];

test.describe.configure({ mode: "serial" });
userRoles.forEach((role) => {
  test.describe("External user dashboard", () => {
    const roleTest = setupBeforeAllTest(UserRole.INDUSTRY_USER_ADMIN);
    roleTest(`Dashboard for role: ${role}`, async ({ page }) => {
      let reporter = false;
      if (role === "INDUSTRY_USER_REPORTER") {
        reporter = true;
        // Update the role to reporter in the DB since we do not have this set up
        const userId = process.env.E2E_INDUSTRY_USER_ADMIN_GUID as string;
        await upsertUserOperatorRecord(userId, "reporter", "Approved");
      }

      // 🛸 Navigate to dashboard page
      const dashboardPage = new DashboardPOM(page);
      await dashboardPage.route();
      let component = "";

      // Say cheese!
      component = `Main Dashboard for ${role}`;
      await takeStabilizedScreenshot(happoPlaywright, page, {
        component: component,
        variant: "filled",
      });
      await analyzeAccessibility(page);

      // Loop through dashboard of each tile
      for (const tile of Object.values(DashboardTiles)) {
        let tileTexts: string[] = [];
        let skipUrlCheck = false;
        switch (tile) {
          case DashboardTiles.ADMINISTRATION:
            tileTexts = Object.values(AdministrationTileText);
            break;
          case DashboardTiles.REGISTRATION:
            tileTexts = Object.values(RegistrationTileText);
            break;
          case DashboardTiles.REPORTING:
            tileTexts = Object.values(ReportingTileText);
            break;
          case DashboardTiles.COMPLIANCE:
            tileTexts = Object.values(ComplianceTileText);
            break;
          case DashboardTiles.REPORT_A_PROBLEM:
            // Report a Problem is a link to an email address, check visibility and href but do not click
            await expect(
              page.getByRole("link", { name: DashboardTiles.REPORT_A_PROBLEM }),
            ).toBeVisible();
            await dashboardPage.assertMailToLinkIsVisible(
              LinkSrc.TILE_REPORT_PROBLEM,
            );

            skipUrlCheck = true;
            break;
          case DashboardTiles.ACCESS_REQUEST:
            // This is for internal user
            tileTexts = Object.values(AccessRequestText);
            await expect(
              page.getByText(tileTexts[0], { exact: true }),
            ).toBeHidden();
            skipUrlCheck = true;
            break;
          default:
            skipUrlCheck = true;
        }

        if (!skipUrlCheck) {
          // Go to dashboard page of each route
          await page.getByRole("link", { name: tile }).first().click();
          await dashboardPage.urlIsCorrect(tile.toLocaleLowerCase(), true);

          for (const text of tileTexts) {
            // Assert visibility of each tile text on the dashboard page
            if (reporter && text === AdministrationTileText.ACCESS_REQUEST) {
              await dashboardPage.linkIsVisible(text, false);
            } else {
              await dashboardPage.linkIsVisible(text, true);
            }
          }
          // Say cheese!
          component = `External user ${tile} Dashboard`;
          await takeStabilizedScreenshot(happoPlaywright, page, {
            component: component,
            variant: "filled",
          });
          // Go back to dashboard
          await dashboardPage.route();
        }
      }
    });
  });
});
