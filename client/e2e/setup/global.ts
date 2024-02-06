/**
 📖
 The globalSetup option in playwright.config.js allows you to specify a JavaScript file that will be executed ONCE before all test suites.
 This file is useful for setting up any global resources, initializing databases, or creating authentication storageStates
 Here we will:
 - create process.env variables for use in test suites
 - create storageState files for authenticated user by role for use in test suites
 */

import { chromium } from "@playwright/test";
// environment variables stored in client/e2e/.env.local
import * as dotenv from "dotenv";
dotenv.config({
  path: "./e2e/.env.local",
});

// 👤 User Roles
import { UserRole } from "@/e2e/utils/enums";
// 🛸 Login Links
import { LoginLink } from "@/e2e/utils/enums";
// 🥞 Connection pool to postgres DB
import { pool } from "@/e2e/utils/pool";
import { navigateAndWaitForLoad } from "../utils/helpers";
// Set the test URL
const url = process.env.E2E_BASEURL || "";
// 🛠️ function: login with Keycloak credentials and store authenticated user by role session's state
/**
📖
In Playwright, the storageState function is used to capture the current state of storage (such as cookies, local storage, etc.) associated with a page.
This captured state can later be used to restore the page to the same state, enabling scenarios like persisting user authentication across different browser sessions
or sharing state between different test cases.
 */
const setupAuth = async (
  user: string,
  password: string,
  storageState: string,
  role: string
) => {
  try {
    let loginButton = LoginLink.INDUSTRY_USER;
    switch (role) {
      case UserRole.CAS_ADMIN:
      case UserRole.CAS_ANALYST:
      case UserRole.CAS_PENDING:
        loginButton = LoginLink.CAS;
        // 🛢 To generate a storageState file for each CAS role...
        // perform an upsert query that inserts or updates the role associated with your IDIR user_guid in the erc.user table.

        // eslint-disable-next-line no-console
        console.log(`Upserting ${user} for role ${role}`);
        const upsert = `
          INSERT INTO erc.user (user_guid, business_guid, bceid_business_name, first_name, last_name, position_title, email, phone_number, app_role_id)
          VALUES
            ($1, '123e4567-e89b-12d3-a456-426614174001', 'bceid_business_name', 'CAS', $2, 'Software Engineer', $3, '123 456 7890', $4)
          ON CONFLICT (user_guid)
          DO UPDATE SET
            app_role_id = EXCLUDED.app_role_id;
        `;
        await pool.query(upsert, [
          process.env.E2E_CAS_USER_GUID,
          user,
          `${user}@test.com`,
          role,
        ]);
        break;
    }

    const browser = await chromium.launch();
    const page = await browser.newPage();

    // 🛸 Navigate to the home page
    await navigateAndWaitForLoad(page, url);

    // Click the login button
    await page.getByRole("button", { name: loginButton }).click();

    // 🔑 Login to Keycloak
    // Fill the user field
    await page.locator("id=user").fill(user);
    // Fill the pw field
    await page.getByLabel("Password").fill(password);
    // Click Continue button
    await page.getByRole("button", { name: "Continue" }).click();

    // 🕒 Wait for the profile navigation link to be present
    // 🚩 BP approach (?) seems to fail: await expect(page.getByTestId("nav-user-profile")).toBeVisible();
    const profileNavSelector = '[data-testid="nav-user-profile"]';
    await page.waitForSelector(profileNavSelector);

    // 💾 Capture the storage state (e.g., auth session cookies) of the current page and saves it to a file specified
    // This storeageState can then be used for e2e tests requiring authentication
    await page.context().storageState({ path: storageState });

    // eslint-disable-next-line no-console
    console.log(
      `Successful authentication setup for ${user} captured in storageState ${storageState}`
    );
  } catch (error) {
    // Handle any errors that occurred during the authentication process
    // eslint-disable-next-line no-console
    console.error(`Authentication failed for ${user}:`, error);
    // Rethrow the error
    throw error;
  }
};

export default async function globalSetup() {
  // 🌍 Perform global setup tasks here...

  // 👤 Set storageState for Authenticated IDIR and BCeid credentials using NextAuth and Keycloak to be used in subsequent test suites
  // eslint-disable-next-line no-console
  console.log(
    "Global setup to authenticate all user roles and store each role session in storageState to be used in test suites to mock user by role."
  );

  // ➰ Loop through the entries of UserRole enum
  for (let [role, value] of Object.entries(UserRole)) {
    let user = process.env.E2E_CAS_USER;
    let pw = process.env.E2E_CAS_USER_PASSWORD;
    role = "E2E_" + role;
    switch (value) {
      case UserRole.INDUSTRY_USER_ADMIN:
      case UserRole.INDUSTRY_USER:
      case UserRole.NEW_USER:
        user = process.env[role];
        pw = process.env[role + "_PASSWORD"];
        // 🔑 Authenticate this user role and save to storageState
        await setupAuth(
          user || "",
          pw || "",
          process.env[role + "_STORAGE"] || "",
          value
        );
        break;
    }
  }
}
