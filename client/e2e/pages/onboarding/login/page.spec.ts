// 🧪 Suite to test the Home page `http://localhost:3000/home`
// 🔍 Asserts the user can login, logout, and login

import { test } from "@playwright/test";
// ⛏️ Helpers
import { login, logout } from "@/e2e/utils/helpers";
// ℹ️ Environment variables
import * as dotenv from "dotenv";
dotenv.config({ path: "./e2e/.env.local" });
// 👤 User Roles
import { UserRole } from "@/e2e/utils/enums";

// 🏷 Annotate test suite as serial
test.describe.serial("Test Page - Home", () => {
  // ➰ Loop through the entries of UserRole enum
  for (let [role, value] of Object.entries(UserRole)) {
    // Only login once for CAS ID...i.e. CAS_PENDING
    // Check if the current role is to skip executing tests
    if (value === UserRole.CAS_ADMIN || value === UserRole.CAS_ANALYST) {
      continue;
    }
    test.describe(`Test User Role - ${value}`, () => {
      // Set user and password based on the user role
      let user = process.env.E2E_CAS_USER as string;
      let pw = process.env.E2E_CAS_USER_PASSWORD as string;
      role = "E2E_" + role;
      switch (value) {
        case UserRole.INDUSTRY_USER_ADMIN:
        case UserRole.INDUSTRY_USER:
        case UserRole.NEW_USER:
          user = process.env[`${role}`] || "";
          pw = process.env[`${role}_PASSWORD`] || "";
          break;
      }
      test("Test Login-Logout-Login", async ({ page }) => {
        await login(page, user, pw, value);
        await logout(page);
        await login(page, user, pw, value);
      });
    });
  }
});
