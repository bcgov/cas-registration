/**
 📖 
 The globalSetup option in playwright.config.js allows you to specify a JavaScript file that will be executed ONCE before all test suites. 
 This file is useful for setting up any global resources, initializing databases, or creating authentication storageStates
 Here we will:
 - create process.env variables for use in test suites
 - create storageState files for authenticated user by role for use in test suites
 */

import { chromium, type FullConfig } from "@playwright/test";
// environment variables stored in client/e2e/.env.local
import * as dotenv from "dotenv";
dotenv.config({
  path: "./e2e/.env.local",
});
// connection to postgres DB
const { Pool } = require("pg");
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_USER_PASSWORD,
  host: "localhost",
  database: "registration",
  port: 5432,
});

// 👤 User Roles
import { UserRole } from "@/e2e/utils/enums";
// 🛸 Login Links
import { LoginLink } from "@/e2e/utils/enums";

// 🛠️ function: login with Keycloak credetials and store authenticated user by role session's state
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
    const url = "http://localhost:3000/home";
    const browser = await chromium.launch();
    const page = await browser.newPage();
    let loginButton = LoginLink.INDUSTRY_USER;
    switch (role) {
      case UserRole.CAS_ADMIN:
      case UserRole.CAS_ANALYST:
      case UserRole.CAS_PENDING:
        loginButton = LoginLink.CAS;
        // 🛢 To generate a storageState file for each CAS role...
        // perform an upsert query that inserts or updates the role associated with your IDIR user_guid in the erc.user table.
        const upsert = `
  INSERT INTO erc.user (user_guid, business_guid, first_name, last_name, position_title, email, phone_number, app_role_id)
  VALUES 
    ($1, '123e4567-e89b-12d3-a456-426614174001', 'CAS', $2, 'Software Engineer', $3, '123 456 7890', $4)
  ON CONFLICT (user_guid)
  DO UPDATE SET 
    app_role_id = EXCLUDED.app_role_id;
`;

        await pool.query(upsert, [
          process.env.CAS_USER_GUID,
          user,
          `${user}@example.com`,
          role,
        ]);
        break;
    }

    // 🔑 Login to get user's Keycloak information and user role set in `client/app/api/auth/[...nextauth]/route.ts` based on data from erc.user table
    await page.goto(url);
    // 🕒 Wait for the navigation to complete
    await page.waitForLoadState("domcontentloaded");

    await page.getByRole("button", { name: loginButton }).click();

    // 🕒 Wait for the user field to be present
    await page.waitForSelector("#user");

    // Click and fill the user field
    await page.locator("#user").click();
    await page.locator("#user").fill(user);

    // Click and fill the password field
    await page.getByLabel("Password").click();
    await page.getByLabel("Password").fill(password);

    // Click the Continue button
    await page.getByRole("button", { name: "Continue" }).click();

    // 🕒 Wait for the profile navigation link to be present
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

export default async function globalSetup(config: FullConfig) {
  // 🌍 Perform global setup tasks here...

  // ℹ️ You can make data available to the tests from this global setup file by setting them as environment variables via process.env.
  // 🛸 Routing - make the baseUrl available
  const projectName = "setup";
  const { baseURL } =
    config.projects.find((project) => project.name === projectName)?.use || {};
  process.env.BASEURL = baseURL;

  // 👤 Set storageState for Authenticated IDIR and BCeid credentials using NextAuth and Keycloak to be used in subsequent test suites
  console.log(
    "Global setup to authenticate all user roles and store each role session in storageState to be used in test suites to mock user by role."
  );

  // ➰ Loop through the entries of UserRole enum
  for (const [role, value] of Object.entries(UserRole)) {
    let user = process.env.CAS_USERNAME;
    let pw = process.env.CAS_PASSWORD;
    switch (value) {
      case UserRole.INDUSTRY_USER_ADMIN:
      case UserRole.INDUSTRY_USER:
      case UserRole.NEW_USER:
        user = process.env[role + "_USERNAME"];
        pw = process.env[role + "_PASSWORD"];
        break;
    }
    // 🔑 Authenticate this user role and save to storageState
    await setupAuth(
      user || "",
      pw || "",
      process.env[role + "_STORAGE"] || "",
      value
    );
  }
}
