import { test, expect } from "@playwright/test";
import { UserRole, LinkSrc } from "@bciers/e2e/utils/enums";
import { DashboardPOM } from "@/dashboard-e2e/poms/dashboard";
import {
  DashboardTiles,
  InternalAdministrationTileText,
  InternalTransfersTileText,
  InternalReportingTileText,
  InternalComplianceTileText,
  AccessRequestText,
} from "@/dashboard-e2e/utils/enums";
import {
  analyzeAccessibility,
  takeStabilizedScreenshot,
} from "@bciers/e2e/utils/helpers";
import { setupBeforeEachTest } from "@bciers/e2e/setupBeforeEach";

const happoPlaywright = require("happo-playwright");

const userRoles = [UserRole.CAS_ADMIN, UserRole.CAS_ANALYST];

userRoles.forEach((role) => {
  test.describe(" Internal user dashboard", () => {
    test.describe.configure({ mode: "serial" });

    // Setup for this specific role
    const roleTest = setupBeforeEachTest(role);
    roleTest(`Dashboard for role: ${role.toUpperCase()}`, async ({ page }) => {
      // Navigate to dashboard page
      const dashboardPage = new DashboardPOM(page);
      await dashboardPage.route();
      let component = "";

      component = `Main Dashboard for ${role.toUpperCase()}`;
      await takeStabilizedScreenshot(happoPlaywright, page, {
        component: component,
        variant: "filled",
      });
      await analyzeAccessibility(page);

      for (const tile of Object.values(DashboardTiles)) {
        let tileTexts: string[] = [];
        let skipUrlCheck = false;

        switch (tile) {
          case DashboardTiles.ADMINISTRATION:
            tileTexts = Object.values(InternalAdministrationTileText);
            break;
          case DashboardTiles.TRANSFERS:
            tileTexts = Object.values(InternalTransfersTileText);
            skipUrlCheck = true;
            break;
          case DashboardTiles.REPORTING:
            tileTexts = Object.values(InternalReportingTileText);
            skipUrlCheck = true;
            break;
          case DashboardTiles.COMPLIANCE:
            tileTexts = Object.values(InternalComplianceTileText);
            break;
          case DashboardTiles.ACCESS_REQUEST:
            tileTexts = Object.values(AccessRequestText);
            await expect(
              page.getByRole("link", { name: tileTexts[0], exact: true }),
            ).toBeVisible();
            skipUrlCheck = true;
            break;
          case DashboardTiles.REPORT_A_PROBLEM:
            await dashboardPage.linkIsVisible(
              DashboardTiles.REPORT_A_PROBLEM,
              true,
            );
            // await expect(page.getByRole('link', { name: DashboardTiles.REPORT_A_PROBLEM })).toBeVisible();
            await dashboardPage.assertMailToLinkIsVisible(
              LinkSrc.TILE_REPORT_PROBLEM,
            );
            skipUrlCheck = true;
            break;
          default:
            skipUrlCheck = true;
            break;
        }

        if (!skipUrlCheck) {
          await page.getByRole("link", { name: tile }).first().click();
          await dashboardPage.urlIsCorrect(tile.toLocaleLowerCase(), true);
        }

        for (const text of tileTexts) {
          if (
            role !== UserRole.CAS_ANALYST &&
            text === InternalTransfersTileText.TRANSFER_OPERATION_OR_FACILITY
          ) {
            await dashboardPage.linkIsVisible(text, false);
          } else {
            await dashboardPage.linkIsVisible(text, true);
          }
        }

        if (!skipUrlCheck) {
          component = `Internal user ${tile} Dashboard`;
          await takeStabilizedScreenshot(happoPlaywright, page, {
            component: component,
            variant: "filled",
          });
          await dashboardPage.route();
        }
      }
    });
  });
});
