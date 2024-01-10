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

// User Roles
import { UserRole } from "../utils/enums";

// Logins
const casUserName = process.env.CAS_USERNAME || "";
const casPassword = process.env.CAS_PASSWORD || "";
const casUserGuid = process.env.CAS_USER_GUID || "";
const industryUserUserName = process.env.INDUSTRY_USER_USERNAME || "";
const industryUserPassword = process.env.INDUSTRY_USER_PASSWORD || "";
const industryUserAdminUserName =
  process.env.INDUSTRY_USER_ADMIN_USERNAME || "";
const industryUserAdminPassword =
  process.env.INDUSTRY_USER_ADMIN_PASSWORD || "";
const newUserName = process.env.NEW_USER_USERNAME || "";
const newUserPassword = process.env.NEW_USER_PASSWORD || "";

// State storage
const casAdminAuthFile = process.env.CAS_ADMIN_STORAGE || "";
const casAnalystAuthFile = process.env.CAS_ANALYST_STORAGE || "";
const casPendingAuthFile = process.env.CAS_PENDING_STORAGE || "";
const industryUserAuthFile = process.env.INDUSTRY_USER_STORAGE || "";
const industryUserAdminAuthFile = process.env.INDUSTRY_USER_ADMIN_STORAGE || "";
const newUserAuthFile = process.env.NEW_USER_STORAGE || "";

// 🛠️ function: login with Keycloak credetials and store authenticated user by role session's state
/**
📖 
In Playwright, the storageState function is used to capture the current state of storage (such as cookies, local storage, etc.) associated with a page. 
This captured state can later be used to restore the page to the same state, enabling scenarios like persisting user authentication across different browser sessions 
or sharing state between different test cases.
 */
const setupAuth = async (
  userName: string,
  password: string,
  authFile: string,
  role?: string
) => {
  try {
    const url = "http://localhost:3000/home";
    const browser = await chromium.launch();
    const page = await browser.newPage();
    let loginButton = "Industrial Operator Log In";
    switch (role) {
      case UserRole.CAS_ADMIN:
      case UserRole.CAS_ANALYST:
      case UserRole.CAS_PENDING:
        loginButton = "Program Administrator Log In";
        // To create a storageState file for each cas role use an upsert query to insert or update the role of your IDIR user_guid in erc.user table
        const upsert = `
  INSERT INTO erc.user (user_guid, business_guid, first_name, last_name, position_title, email, phone_number, app_role_id)
  VALUES 
    ('${casUserGuid}', '123e4567-e89b-12d3-a456-426614174001', 'CAS', '${casUserName}', 'Software Engineer', '${casUserName}@example.com', '123 456 7890', '${role}')
  ON CONFLICT (user_guid)
  DO UPDATE SET 
    app_role_id = EXCLUDED.app_role_id;
`;
        await pool.query(upsert);
        break;
    }

    // 🔑 Login to get the user role set in `client/app/api/auth/[...nextauth]/route.ts`based on data from erc.user table
    await page.goto(url);
    await page.getByRole("button", { name: loginButton }).click();
    await page.locator("#user").click();
    await page.locator("#user").fill(userName);
    await page.getByLabel("Password").click();
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Continue" }).click();

    // 🕒 Wait for the profile navigation link to be present
    const profileNavSelector = '[data-testid="nav-user-profile"]';
    await page.waitForSelector(profileNavSelector);

    // 💾 Capture the storage state (e.g., auth session cookies) of the current page and saves it to a file specified
    // This storeageState can then be used for e2e tests requiring authentication
    await page.context().storageState({ path: authFile });

    // eslint-disable-next-line no-console
    console.log(
      `Successful authentication setup for ${userName} captured in storageState ${authFile}`
    );
  } catch (error) {
    // Handle any errors that occurred during the authentication process
    // eslint-disable-next-line no-console
    console.error(`Authentication failed for ${userName}`, error);
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
    "Global setup to authenticate and store user by role sessions used to mock authentication user state in test suites."
  );

  // 🔑 Authenticates with your IDIR credentials and stores the next-auth.session-token as role "cas_pending"
  await setupAuth(
    casUserName,
    casPassword,
    casPendingAuthFile,
    UserRole.CAS_PENDING
  );

  // 🔑 Authenticates with your IDIR credentials and stores the next-auth.session-token as role "cas_analyst"
  await setupAuth(
    casUserName,
    casPassword,
    casAnalystAuthFile,
    UserRole.CAS_ANALYST
  );

  // 🔑 Authenticates with your IDIR credentials and stores the next-auth.session-token as role "cas_admin"
  await setupAuth(
    casUserName,
    casPassword,
    casAdminAuthFile,
    UserRole.CAS_ADMIN
  );

  // 🔑 Authenticates with bc-cas-dev credentials and stores the next-auth.session-token as role "industry_user_admin"
  // Note: expects bc-cas-dev is in bc_obps/registration/fixtures/mock/user.json
  // Note: expects bc-cas-dev is in bc_obps/registration/fixtures/mock/userOperTilesator.json: | admin | Approved | ba2ba6... |
  await setupAuth(
    industryUserAdminUserName,
    industryUserAdminPassword,
    industryUserAdminAuthFile
  );

  // 🔑 Authenticates with bc-cas-dev-secondary credentials and stores the next-auth.session-token as role "industry_user"
  // Note: expects bc-cas-dev-secondary is in bc_obps/registration/fixtures/mock/user.json
  await setupAuth(
    industryUserUserName,
    industryUserPassword,
    industryUserAuthFile
  );

  // 🔑 Authenticates with bc-cas-dev-three credentials and stores the next-auth.session-token as role "" (new user)
  // Note: expects bc-cas-dev-three is NOT in bc_obps/registration/fixtures/mock/user.json
  await setupAuth(newUserName, newUserPassword, newUserAuthFile);
}
