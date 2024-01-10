import { test, expect } from "@playwright/test";
const { Pool } = require("pg");

import * as dotenv from "dotenv";
dotenv.config({
  path: "../e2e/.env.local",
});

// 👤 User Roles
import { UserRole } from "../../../utils/enums";

// Access the baseURL made available to proces.env from `client/e2e/setup/global.ts`
const { BASEURL } = process.env;
// set the test url
const url = BASEURL + "dashboard";

// 🛠️ Function: performs the submit success test
const submitSuccessTest = async (page: any) => {
  // 🔍 Assert that the current URL ends with "/profile"
  expect(page.url().toLocaleLowerCase()).toContain("/profile");

  //  💾 Submit the user profile
  await page.getByLabel("First Name*").click();
  await page.getByLabel("First Name*").fill("TEST FIRST NAME");
  await page.getByLabel("Last Name*").click();
  await page.getByLabel("Last Name*").fill("TEST LAST NAME");
  await page.getByLabel("Phone Number*").click();
  await page.getByLabel("Phone Number*").fill("123 456 7890");
  await page.getByLabel("Position Title*").click();
  await page.getByLabel("Position Title*").fill("TEST POSITION");
  await page.getByRole("button", { name: "Submit" }).click();

  // 🕒 Wait for the submit to complete
  await page.waitForLoadState("load");

  // 🔍 Assert that the user profile is in DB and has role allowing access to Dashboard
  expect(page.url().toLocaleLowerCase()).toContain("/dashboard");
};

// 🛠️ Function: performs the Submit Fail test
const submitFailTest = async (page: any) => {
  // 🔍 Assert that the current URL ends with "/profile"
  expect(page.url().toLocaleLowerCase()).toContain("/profile");

  // Submit the user profile with errors
  await page.getByLabel("Phone Number*").click();
  // Error: phone format
  await page.getByLabel("Phone Number*").fill("123 456 789");
  await page.getByRole("button", { name: "Submit" }).click();

  // 🕒 Wait for the error text to appear on the page after Submit click
  const formatErrorText = await page.textContent(
    "text=Format should be ### ### ####"
  );
  // 🔍 Assert that the phone format error message displays
  expect(formatErrorText).toContain("Format should be ### ### ####");
};

// 🛠️ Function: deletes the new user record from the database
const deleteNewUserRecord = async () => {
  try {
    const pool = new Pool({
      user: process.env.DB_USER,
      password: process.env.DB_USER_PASSWORD,
      host: "localhost",
      database: "registration",
      port: 5432,
    });
    await pool.query(
      `DELETE FROM erc.user WHERE user_guid='${process.env.NEW_USER_USERID}'`
    );
    await pool.end();
  } catch (error) {
    console.error("Error deleting new user record:", error);
  }
};

// 🏷 Annotate test suite as serial
test.describe.configure({ mode: "serial" });

test.describe("Test Profile Page", () => {
  // ➰ Loop through the entries of UserRole enum
  for (const [role, value] of Object.entries(UserRole)) {
    const storageState = process.env[role + "_STORAGE"] || "";
    test.describe(`Test User Role - ${value}`, () => {
      test.use({ storageState: storageState });
      switch (value) {
        case UserRole.NEW_USER:
          test.afterEach(async () => {
            // Use the helper function to delete the new user record from the database
            await deleteNewUserRecord();
          });
          test("Test Submit Success", async ({ page }) => {
            await page.goto(url);
            // 🕒 Wait for the navigation to complete
            await page.waitForLoadState("load");
            // New user has no role; so, NO access to Dashboard
            // Redirected to: http://localhost:3000/dashboard/profile by `client/middlewares/withAuthorization.tsx`

            // Use the helper function for Submit Success test
            await submitSuccessTest(page);
          });
          test("Test Submit Fail", async ({ page }) => {
            await page.goto(url);
            // 🕒 Wait for the navigation to complete
            await page.waitForLoadState("load");
            // New user has no role; so, NO access to Dashboard
            // Redirected to: http://localhost:3000/dashboard/profile by `client/middlewares/withAuthorization.tsx`

            // Use the helper function for Submit Fail test
            await submitFailTest(page);
          });
          break;
        case UserRole.CAS_ADMIN:
        case UserRole.CAS_ANALYST:
        case UserRole.CAS_PENDING:
        case UserRole.INDUSTRY_USER_ADMIN:
        case UserRole.INDUSTRY_USER:
          test("Test Submit Success", async ({ page }) => {
            await page.goto(url);
            // 🕒 Wait for the profile navigation link to be present
            const profileNavSelector = '[data-testid="nav-user-profile"]';
            await page.waitForSelector(profileNavSelector);
            // Trigger click on the profile navigation link to navigate to /profile
            await page.click(profileNavSelector);
            await page.waitForLoadState("load");

            // Use the helper function for Submit Success test
            await submitSuccessTest(page);
          });
          test("Test Submit Fail", async ({ page }) => {
            await page.goto(url);
            // 🕒 Wait for the profile navigation link to be present
            const profileNavSelector = '[data-testid="nav-user-profile"]';
            await page.waitForSelector(profileNavSelector);
            // Trigger click on the profile navigation link to navigate to /profile
            await page.click(profileNavSelector);
            await page.waitForLoadState("load");

            // Use the helper function for Submit Fail test
            await submitFailTest(page);
          });
          break;
      }
    });
  }
});
