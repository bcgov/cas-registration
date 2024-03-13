// 🧪 Suite to test the bceidbusiness new user workflow using storageState
// 🔍 Asserts new user is redirected to profile

import { test, expect } from "@playwright/test";
// 🪄 Page Object Models
import { DashboardPOM } from "@/e2e/poms/dashboard";
// ℹ️ Environment variables
import * as dotenv from "dotenv";
import { OperatorPOM } from "@/e2e/poms/operator";
dotenv.config({ path: "./e2e/.env.local" });

// 🏷 Annotate test suite as serial
test.describe.configure({ mode: "serial" });
test.describe("Test Workflow industry_user", () => {
  // 👤 run test using the storageState for this role
  const storageState = JSON.parse(
    process.env.E2E_INDUSTRY_USER_STORAGE as string
  );
  // Note: specify storageState for each test file or test group, instead of setting it in the config. https://playwright.dev/docs/next/auth#reuse-signed-in-state
  test.use({ storageState: storageState }); // this will error if no such file or directory
  test("Test Redirect to Dashboard", async ({ page }) => {
    // 🛸 Navigate to dashboard page
    const dashboardPage = new DashboardPOM(page);
    await dashboardPage.route();
    // 🔍 Assert that the current URL ends with "(authenticated)/dashboard"
    await dashboardPage.urlIsCorrect();
  });

  test("Select existing operator (via legal name) and request admin access", async ({
    page,
  }) => {
    // 🛸 Navigate to dashboard page
    const dashboardPage = new DashboardPOM(page);
    const selectOperatorPage = new OperatorPOM(page);
    await dashboardPage.route();
    // 🔍 Assert that the current URL ends with "(authenticated)/dashboard"
    await dashboardPage.urlIsCorrect();
    // brianna you need to clear the db for this, Sepehr is working on it
    await dashboardPage.clickSelectOperatorTile();
    await selectOperatorPage.urlIsCorrect();
    await page.getByPlaceholder("Enter Business Legal Name").click();
    await page.getByPlaceholder("Enter Business Legal Name").fill("Operator");
    await page.getByText(/Operator 1 Legal Name/i).click();
    // happo
    await selectOperatorPage.buttonSelectOperator.click();
    await page.getByText(selectOperatorPage.confirmationMessage);
    // happo
    await selectOperatorPage.buttonYesThisIsMyOperator.click();
    await page.getByText(
      /Looks like operator Operator 1 Legal Name does not have Administrator access set up./i
    );
    // happo
    await selectOperatorPage.buttonRequestAdministratorAccess.click();
    await page.getByText(
      /Your access request for Operator 1 Legal Name as its Operation Representative has been received and will be reviewed./i
    );
    // happo
  });

  test("Select existing operator (via CRA business number) and request non-admin access", async ({
    page,
  }) => {
    // 🛸 Navigate directly to the operator page (already tested navigating from the dashboard in the first test)
    const selectOperatorPage = new OperatorPOM(page);
    await selectOperatorPage.route();
    await selectOperatorPage.urlIsCorrect();
    await selectOperatorPage.selectByCraNumber("987654321");
    await page.getByText(selectOperatorPage.confirmationMessage);
    await selectOperatorPage.buttonYesThisIsMyOperator.click();
    await page.getByText(/something/i);
    // happo
    await selectOperatorPage.buttonRequestAdministratorAccess.click();
    await page.getByText(/something/i);
    // happo
  });

  test("Add a new operator", async ({ page }) => {
    // 🛸 Navigate directly to the operator page (already tested navigating from the dashboard in the first test)
    const selectOperatorPage = new OperatorPOM(page);
    await selectOperatorPage.route();
    await selectOperatorPage.urlIsCorrect();
    await selectOperatorPage.linkAddOperator.click();
    await expect(page.getByText(/Operator Information/i)).toBeVisible();
    await selectOperatorPage.triggerValidationErrors();
    await selectOperatorPage.fillFormAndSubmit();
  });

  test("Go back and return navigation works", async ({ page }) => {
    // 🛸 Navigate directly to the operator page (already tested navigating from the dashboard in the first test)
    const selectOperatorPage = new OperatorPOM(page);
    await selectOperatorPage.route();
    await selectOperatorPage.urlIsCorrect();
    await selectOperatorPage.selectByCraNumber("987654321");
    await page.getByText(selectOperatorPage.confirmationMessage);
    await selectOperatorPage.buttonYesThisIsMyOperator.click();
    await page.getByText(/something/i);
    await page.getByText(/go back/i).click();
    await page.getByText(selectOperatorPage.confirmationMessage);
    await page.getByText(/return/i).click();
    await page.getByText(/Which operator would you like to log in to?/i);
  });

  //   assert "My Operator\create new Operator"
  //  is able to search for their operator by operator legal name (fuzzy search) or CRA business number (exact matches only), or has the option of adding a new operator
  //  is able to select an operator from the search results and sees operator preview, with options to go back to the search screen, or confirm "Yes this is my operator"
  //  once they've selected their operator from the search and confirmed "Yes this is my operator", there's 2 scenarios:
  // - [ ] no other user has requested admin access for the operator, in which case industry_user should be prompted whether they want to request to be admin
  // - [ ] some other user has already requested admin access for the same operator, in which case the industry_user can request access to the Operator, but they won't automatically be the admin for the operator
  //  is able to create a new operator from the Select Operator page, and populate all form fields, with different scenarios:
  // - [ ] operator has no parent company
  // - [ ] operator has 1 parent company
  // - [ ] operator has multiple parent companies
});
