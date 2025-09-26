import { test } from "@playwright/test";
import { UserRole } from "@bciers/e2e/utils/enums";
import { DashboardPOM } from "@/dashboard-e2e/poms/dashboard";
import {
  analyzeAccessibility,
  takeStabilizedScreenshot,
} from "@bciers/e2e/utils/helpers";
import { setupBeforeEachTest } from "@bciers/e2e/setupBeforeEach";
import { linkIsVisible } from "@bciers/e2e/utils/helpers";

const happoPlaywright = require("happo-playwright");

const userRoles = [
  UserRole.CAS_ADMIN,
  UserRole.CAS_ANALYST,
  UserRole.CAS_DIRECTOR,
];

userRoles.forEach((role) => {
  test.describe(" Internal user dashboard", () => {
    test.describe.configure({ mode: "serial" });

    // Setup for this specific role
    const roleTest = setupBeforeEachTest(role);
    roleTest(`Dashboard for role: ${role.toUpperCase()}`, async ({ page }) => {
      // 🛸 Navigate to dashboard page
      const dashboardPage = new DashboardPOM(page);
      await dashboardPage.route();
      let component = "";

      component = `Main Dashboard for ${role.toUpperCase()}`;
      // Say cheese!
      await takeStabilizedScreenshot(happoPlaywright, page, {
        component: component,
        variant: "default",
      });
      await analyzeAccessibility(page);
    });
  });
});
