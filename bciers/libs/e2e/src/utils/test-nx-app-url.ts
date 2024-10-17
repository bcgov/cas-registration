import { test, expect } from "@playwright/test";
// ☰ Enums
import { UserRole } from "@/e2e/utils/enums";
import * as dotenv from "dotenv";
dotenv.config({ path: "./e2e/.env.local" });

// NOTE:: This is just a quick basic test setup to ensure that the database and auth are working in CI
// Feel free to delete this or modify it as needed

const testNxProjectUrl = async (zones: string[]) => {
  // 🏷 Annotate test suite as serial
  test.describe.configure({ mode: "serial" });
  zones.forEach((zone) => {
    test.describe(`Test ${zone} url`, () => {
      const url = `${process.env.E2E_BASEURL}${zone}`;
      const user =
        zone === "reporting"
          ? UserRole.CAS_ADMIN
          : UserRole.INDUSTRY_USER_ADMIN;
      const testRole = `E2E_${user.toUpperCase()}_STORAGE_STATE`;
      const storageState = JSON.parse(process.env[testRole] as string);
      test.use({ storageState: storageState });

      test("Test url reflects Nx app", async ({ page }) => {
        // 🛸 Navigate to app root page
        await page.goto(url);

        // 🛠 Assert that the zone is in the current URL
        await expect(page).toHaveURL(new RegExp(`.*${zone}.*`));
      });
    });
  });
};

export default testNxProjectUrl;
