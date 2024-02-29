// 🧪 Suite to test `client/app/(authenticated)/dashboard/profile/page.tsx`

import { test } from "@playwright/test";
// 🪄 Page Object Models
import { DashboardPOM } from "@/e2e/poms/dashboard";
import { ProfilePOM } from "@/e2e/poms/profile";
// ☰ Enums
import { UserRole } from "@/e2e/utils/enums";
// ℹ️ Environment variables
import * as dotenv from "dotenv";
dotenv.config({ path: "./e2e/.env.local" });

// 🏷 Annotate test suite as serial
test.describe.configure({ mode: "serial" });
// ➰ Loop through the entries of UserRole enum
for (let [role, value] of Object.entries(UserRole)) {
  role = "E2E_" + role;
  const storageState = process.env[role + "_STORAGE"] as string;
  test.describe(`Test Profile for ${value}`, () => {
    // 👤 run test as this role
    test.use({ storageState: storageState });
    test("Test Update", async ({ page }) => {
      // 🛸 Navigate to profile page
      const profilePage = new ProfilePOM(page);
      await profilePage.route();
      // 🔍 Assert that the current URL
      await profilePage.urlIsCorrect();
      // 🔍 Assert profile update validates required fields
      await profilePage.updateFail();
      // 🔍 Assert profile update success
      await profilePage.updateSuccess();
      //🔍 Assert profile name reflects the updated user profile full name
      await profilePage.userFullNameIsCorrect("e2e first name* e2e last name*");

      switch (value) {
        case UserRole.NEW_USER:
          // 🔍 Assert that the current URL
          const dashboardPage = new DashboardPOM(page);
          await dashboardPage.urlIsCorrect();
          break;
      }
    });
  });
}
