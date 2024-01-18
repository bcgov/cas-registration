// 🧪 Suite to test the Profile page `http://localhost:3000/dashboard/profile`
// 🔍 Asserts the form required fields, create, and update functionality

import { test, expect } from "@playwright/test";
import * as dotenv from "dotenv";
dotenv.config({
  path: "./e2e/.env.local",
});

// 👤 User Roles
import { UserRole } from "@/e2e/utils/enums";
// ⛏️ Helpers
import {
  navigateAndWaitForLoad,
  getFieldRequired,
  getFieldAlerts,
} from "@/e2e/utils/helpers";
// 🥞 Connection pool to postgres DB
import { pool } from "@/e2e/utils/pool";

// Set the test url
const url = process.env.BASEURL + "dashboard/profile";

// 🛠️ Function: performs the submit success test
const submitSuccessTest = async (page: any, role: string) => {
  // 🛸 Navigate to the profile page
  await navigateAndWaitForLoad(page, url);
  // Locate all required fields within the fieldset
  const requiredFields = await getFieldRequired(page);
  if (requiredFields) {
    //  💾 Set required input fields
    for (const input of requiredFields) {
      const labelText = await input.textContent();
      const inputField = await page.getByLabel(labelText);
      // Click the field to focus it
      await inputField.click();
      if (labelText === "Phone Number*") {
        await page.getByLabel(labelText).fill("987 654 3210"); //Format should be ### ### ####
      } else {
        await inputField.fill(`E2E TEST ${labelText}`);
      }
    }
  }
  if (role === UserRole.NEW_USER) {
    // Click the Submit button and wait for navigation
    await Promise.all([
      // 🕒  Wait for navigation after form submission
      page.waitForNavigation(),
      // Click the Submit button
      page.getByRole("button", { name: "Submit" }).click(),
    ]);
    // Add expectation for the URL after successful submission
    expect(page.url().toLocaleLowerCase()).toContain("/dashboard");
  } else {
    // Click the Submit button
    await page.getByRole("button", { name: "Submit" }).click();
    // 🕒 Wait for the success message to be attached to the DOM
    await page.waitForSelector("text=Success", { state: "attached" });
    // Check if the success message existed at some point
    const isSuccessExisted = (await page.$("text=Success")) !== null;
    //  🔍 Assert that the success message existed at some point
    expect(isSuccessExisted).toBe(true);
  }
};

// 🛠️ Function: performs the Submit Fail test
const submitFailTest = async (page: any) => {
  // 🛸 Navigate to the profile page
  await navigateAndWaitForLoad(page, url);
  // Locate all required fields within the fieldset
  const requiredFields = await getFieldRequired(page);
  if (requiredFields) {
    // 📛 Clear the required input fields to trigger alerts
    for (const input of requiredFields) {
      const labelText = await input.textContent();
      const inputField = await page.getByLabel(labelText);
      // Click the field to focus it
      await inputField.click();
      if (labelText === "Phone Number*") {
        await page.getByLabel(labelText).fill("987 654 321"); //Format should be ### ### ####
      } else {
        await inputField.clear();
      }
    }
    // Click the Submit button
    await page.getByRole("button", { name: "Submit" }).click();
    // Locate all alert elements within the fieldset
    const alertElements = await getFieldAlerts(page);
    // 🔍 Assert there to be exactly the same number of required fields and alert elements
    expect(requiredFields.length).toBe(alertElements.length);
  }
};

// 🛠️ Function: deletes the new user record from the database
const deleteNewUserRecord = async () => {
  try {
    const query = {
      text: "DELETE FROM erc.user WHERE user_guid = $1",
      values: [process.env.NEW_USER_USERID],
    };
    await pool.query(query);
  } catch (error) {
    console.error("Error deleting new user record:", error);
  }
};

// 🏷 Annotate test suite as serial
test.describe.configure({ mode: "serial" });

test.describe("Test Page - Profile", () => {
  // ➰ Loop through the entries of UserRole enum
  for (const [role, value] of Object.entries(UserRole)) {
    test.describe(`Test User Role - ${value}`, () => {
      // 👤 run test as this role
      const storageState = process.env[role + "_STORAGE"] || "";
      test.use({ storageState: storageState });
      switch (value) {
        case UserRole.NEW_USER:
          test.afterEach(async () => {
            // Use the helper function to delete the new user record from the database
            await deleteNewUserRecord();
          });
          break;
      }
      test("Test Submit Success", async ({ page }) => {
        await submitSuccessTest(page, value);
      });
      test("Test Submit Fail", async ({ page }) => {
        await submitFailTest(page);
      });
    });
  }
});
