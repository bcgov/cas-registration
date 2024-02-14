/**
 📖
 The globalSetup option in playwright.config.js allows you to specify a JavaScript file that will be executed ONCE before all test suites.
 This file is useful for setting up any global resources, initializing databases, or creating authentication storageStates
 Here we will:
 - create process.env variables for use in test suites
 - create storageState files for authenticated user by role for use in test suites
 NOTE:
 Debugging options: https://playwright.dev/docs/test-global-setup-teardown#capturing-trace-of-failures-during-global-setup
 */

import { chromium } from "@playwright/test";
// 🪄 Page Object Models
import { HomePOM } from "@/e2e/poms/home";
// ☰ Enums
import { UserRole } from "@/e2e/utils/enums";
// 🥞 Connection pool to postgres DB
import { pool } from "@/e2e/utils/pool";
// ℹ️ Environment variables
import * as dotenv from "dotenv";
dotenv.config({
  path: "./e2e/.env.local",
});

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
  role: string,
) => {
  // ✨  Launch new instance of the Chromium browser
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  try {
    // 🛢 To generate a storageState file for each CAS role...
    // perform an upsert query that inserts or updates the role associated with your IDIR user_guid in the erc.user table.
    // then login with a cas ID will be assigned this role in client/app/api/auth/[...nextauth]/route.ts
    switch (role) {
      case UserRole.CAS_ADMIN:
      case UserRole.CAS_ANALYST:
      case UserRole.CAS_PENDING:
        // eslint-disable-next-line no-console
        console.log(`🥞 Upserting ${user} for role ${role}`);
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
    // 🛸 Navigate to home page
    const homePage = new HomePOM(page);
    await homePage.route();
    // 🔑 Login
    // eslint-disable-next-line no-console
    console.log(`🔑 Logging in user ${user}`);
    await homePage.login(user, password, role);
    await homePage.userIsLoggedIn();
    // 💾 Capture the storage state (e.g., auth session cookies) of the current page and saves it to a file specified
    // This storeageState can then be used for e2e tests requiring authentication
    await page.context().storageState({ path: storageState });
    // eslint-disable-next-line no-console
    console.log(
      `🤸 Successful authentication setup for ${user} captured in storageState ${storageState} 🤸`,
    );
    await browser.close();
  } catch (error) {
    // Handle any errors that occurred during the authentication process
    await browser.close();
    // eslint-disable-next-line no-console
    console.error(`Authentication failed for ${user}:`, error);
    throw error;
  }
};

export default async function globalSetup() {
  // 🌍 Perform global setup tasks here...

  // 👤 Set storageState for Authenticated IDIR and BCeid credentials using NextAuth and Keycloak to be used in subsequent test suites
  // eslint-disable-next-line no-console
  console.log(
    "👤 Global setup to authenticate all user roles and store each session in storageState to be used in test suites to mock user by role.",
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
        break;
    }
    // Retry mechanism with maximum number of retries for flaky Keycloak?
    const maxRetries = 3;
    let retries = 0;
    let success = false;
    while (!success && retries < maxRetries) {
      try {
        // 🔑 Authenticate this user role and save to storageState
        await setupAuth(
          user || "",
          pw || "",
          process.env[role + "_STORAGE"] as string,
          value,
        );
        success = true; // Set success to true if setupAuth succeeds
      } catch (error) {
        // Increment retries count and log error
        retries++;
        // eslint-disable-next-line no-console
        console.error(
          `🐛 Error in setupAuth: ${error}. Retrying (${retries}/${maxRetries})...`,
        );
      }
    }
    if (!success) {
      // Throw an error if setupAuth fails after maximum retries
      throw new Error(`Unable to authenticate for role: ${value}`);
    }
  }
}
