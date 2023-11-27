// Setup dependancy: Saves role storage state to a file in the .auth directory
import { test as setup, expect } from "@playwright/test";
// environment variables stored in client/e2e/.env.local
import * as dotenv from "dotenv";
dotenv.config({
  path: "./e2e/.env.local",
});

// Logins
const casAdminUserName = process.env.CAS_ADMIN_USERNAME || "";
const casAdminPassword = process.env.CAS_ADMIN_PASSWORD || "";
const industryUserUserName = process.env.INDUSTRY_USER_USERNAME || "";
const industryUserPassword = process.env.INDUSTRY_USER_PASSWORD || "";
// State storage
const casAdminAuthFile = process.env.CAS_ADMIN_STORAGE || "";
const casAnalystAuthFile = process.env.CAS_ANALYST_STORAGE || "";
const casPendingAuthFile = process.env.CAS_PENDING_STORAGE || "";
const industryUserAuthFile = process.env.INDUSTRY_USER_STORAGE || "";
const industryUserAdminAuthFile = process.env.INDUSTRY_USER_ADMIN_STORAGE || "";

// 🛠️ function: login with valid ID and stores auth state
const setupAuth = async (
  page: any,
  context: any,
  button: string,
  username: string,
  password: string,
  authFile: string,
) => {
  // 🔑 Login
  console.log(authFile);
  await page.goto("http://localhost:3000/home");
  await page.getByRole("button", { name: button }).click();
  await page.locator("#user").click();
  await page.locator("#user").fill(username);
  await page.getByLabel("Password").click();
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Continue" }).click();

  // Wait for the profile navigation link to be present
  const profileNavSelector = '[data-testid="profile-nav-user"]';
  await page.waitForSelector(profileNavSelector);

  // Assert that authenticated user profile link is visible
  expect(await page.isVisible(profileNavSelector)).toBe(true);

  // 💾 Capture the storage state (e.g., cookies, local storage) of the current page and saves it to a file specified
  await context.storageState({ path: authFile });
};

// 🛠️ function: updates mocked playwright/.auth/file to be valid
function updateSessionToken(jsonFilePath: string): void {
  try {
    // Modify the JSON file content as needed
    const fs = require("fs");
    // Read the content of the JSON file
    const content = fs.readFileSync(jsonFilePath, "utf-8");

    // Parse the JSON content
    const data = JSON.parse(content);

    // Calculate the new expiration time (30 minutes from now)
    const thirtyMinutesInMilliseconds = 30 * 60 * 1000; // 30 minutes in milliseconds
    const newExpiresValue = new Date().getTime() + thirtyMinutesInMilliseconds;

    // Modify objects that start with "next-auth.session-token"
    for (const key in data) {
      if (key.startsWith("next-auth.session-token")) {
        data[key].expires = newExpiresValue;
      }
    }

    // Save the modified data back to the JSON file
    fs.writeFileSync(jsonFilePath, JSON.stringify(data, null, 2));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(`Error updating mock token ${jsonFilePath}:` + error);
  }
}

setup("Setup Auth - cas_admin", async ({ page, context }) => {
  await setupAuth(
    page,
    context,
    "Program Administrator Log In",
    casAdminUserName,
    casAdminPassword,
    casAdminAuthFile,
  );
});

setup("Setup Auth - cas_analyst", async () => {
  // Note: mocked auth session created using
  // npx playwright codegen localhost:3000 --save-storage=playwright/.auth/cas_analyst.json
  // with hardcoded role in client/app/api/auth/[...nextauth]/route.ts
  updateSessionToken(casAnalystAuthFile);
});

setup("Setup Auth - cas_pending", async () => {
  // Note: mocked auth session created using
  // npx playwright codegen localhost:3000 --save-storage=playwright/.auth/cas_pending.json
  // with hardcoded role in client/app/api/auth/[...nextauth]/route.ts
  updateSessionToken(casPendingAuthFile);
});

setup("Setup Auth - industry_user", async ({ page, context }) => {
  await setupAuth(
    page,
    context,
    "Industrial Operator Log In",
    industryUserUserName,
    industryUserPassword,
    industryUserAuthFile,
  );
});

setup("Setup Auth - industry_user_admin", async () => {
  // Note: mocked auth session created using
  // npx playwright codegen localhost:3000 --save-storage=playwright/.auth/industry_user_admin.json
  // with hardcoded role in client/app/api/auth/[...nextauth]/route.ts
  updateSessionToken(industryUserAdminAuthFile);
});
