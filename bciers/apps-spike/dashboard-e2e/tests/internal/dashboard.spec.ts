import { expect } from "@playwright/test";
import { UserRole } from "@bciers/e2e/utils/enums";
import { DashboardPOM } from "@/dashboard-e2e/poms/dashboard";
import {
  analyzeAccessibility,
  takeStabilizedScreenshot,
} from "@bciers/e2e/utils/helpers";
import { setupBeforeEachTest } from "@bciers/e2e/setupBeforeEach";
import { linkIsVisible } from "@bciers/e2e/utils/helpers";
import {
  InternalDashboardLinks,
  InternalDashboardTiles,
} from "@/dashboard-e2e/utils/enums";

const userRoles = [
  UserRole.CAS_ADMIN,
  UserRole.CAS_ANALYST,
  UserRole.CAS_DIRECTOR,
];

const getLinkVisibility = (
  link: InternalDashboardLinks,
  role: UserRole,
): boolean => {
  const isTransferLink =
    link === InternalDashboardLinks.TRANSFER_OPERATION_OR_FACILITY;
  // Transfer link should be hidden for admin only, visible for analyst and director
  // All other links should be visible for all roles
  if (isTransferLink && role === UserRole.CAS_ADMIN) {
    return false;
  }
  return true;
};

userRoles.forEach((role) => {
  const test = setupBeforeEachTest(role);
  test.describe("Internal user dashboard", () => {
    test.describe.configure({ mode: "serial" });

    test(`Dashboard for role: ${role.toUpperCase()}`, async ({
      page,
      happoScreenshot,
    }) => {
      // 🛸 Navigate to dashboard page
      const dashboardPage = new DashboardPOM(page);
      await dashboardPage.route();
      let component = "";

      component = `Main Dashboard for ${role.toUpperCase()}`;
      // Say cheese!
      await takeStabilizedScreenshot(happoScreenshot, page, {
        component: component,
        variant: "default",
      });
      await analyzeAccessibility(page);

      for (const linkToCheck of Object.values(InternalDashboardLinks)) {
        const shouldBeVisible = getLinkVisibility(linkToCheck, role);
        await linkIsVisible(page, linkToCheck, shouldBeVisible, true);
      }

      for (const tile of InternalDashboardTiles) {
        const tileText = page.getByRole("heading", { name: tile, exact: true });
        await expect(tileText).toBeVisible();
      }
    });
  });
});
