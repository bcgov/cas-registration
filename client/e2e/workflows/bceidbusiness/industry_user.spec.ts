// 🧪 Suite to test the bceidbusiness new user workflow using storageState
// 🔍 Asserts new user is redirected to profile

import { test, expect, APIResponse } from "@playwright/test";
// 🪄 Page Object Models
import { DashboardPOM } from "@/e2e/poms/dashboard";
// ℹ️ Environment variables
import * as dotenv from "dotenv";
import { OperatorPOM } from "@/e2e/poms/operator";
import { fieldsUpdate } from "@/e2e/utils/helpers";
import { deleteUserOperatorRecord } from "@/e2e/utils/queries";
dotenv.config({ path: "./e2e/.env.local" });
const happoPlaywright = require("happo-playwright");

test.beforeEach(async ({ context }) => {
  await happoPlaywright.init(context);
  let response: APIResponse = await context.request.get(
    "http://localhost:8000/api/registration/test-setup"
  );
  // Wait for the response and check for success status text and code (e.g., 200)
  expect(await response.text()).toBe("Test setup complete.");
  expect(response.status()).toBe(200);

  await deleteUserOperatorRecord(process.env.E2E_INDUSTRY_USER_GUID as string);
});

test.afterEach(async () => {
  await happoPlaywright.finish();
});

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
    const pageContent = page.locator("html");
    await happoPlaywright.screenshot(dashboardPage.page, pageContent, {
      component: "Industry User Dashboard page",
      variant: "industry_user",
    });
  });

  test("Select existing operator (via legal name) and request admin access", async ({
    page,
  }) => {
    let pageContent;
    // 🛸 Navigate to dashboard page
    const dashboardPage = new DashboardPOM(page);
    const selectOperatorPage = new OperatorPOM(page);
    await dashboardPage.route();
    // 🔍 Assert that the current URL ends with "(authenticated)/dashboard"
    await dashboardPage.urlIsCorrect();
    // brianna you need to clear the user_operator table for this, Sepehr is working on it
    await dashboardPage.clickSelectOperatorTile();
    await selectOperatorPage.urlIsCorrect();

    pageContent = page.locator("html");
    await happoPlaywright.screenshot(page, pageContent, {
      component: "Select operator page",
      variant: "default",
    });

    await page.getByPlaceholder("Enter Business Legal Name").click();
    await page.getByPlaceholder("Enter Business Legal Name").fill("Operator");
    await page.getByText(/Operator 1 Legal Name/i).click();
    // happo--debatable here
    await selectOperatorPage.buttonSelectOperator.click();
    await expect(
      page.getByText(selectOperatorPage.confirmationMessage)
    ).toBeVisible();

    pageContent = page.locator("html");
    await happoPlaywright.screenshot(page, pageContent, {
      component: "Select operator confirmation message",
      variant: "default",
    });

    await selectOperatorPage.buttonYesThisIsMyOperator.click();
    await expect(
      page.getByText(/does not have Administrator access set up./i)
    ).toBeVisible();

    pageContent = page.locator("html");
    await happoPlaywright.screenshot(page, pageContent, {
      component: "Select operator no administrator message",
      variant: "default",
    });

    await selectOperatorPage.buttonRequestAdministratorAccess.click();
    await expect(
      page.getByText(/has been received and will be reviewed./i)
    ).toBeVisible();

    pageContent = page.locator("html");
    await happoPlaywright.screenshot(page, pageContent, {
      component: "Select operator admin access request confirmation",
      variant: "default",
    });
  });

  test("Select existing operator (via CRA business number) and request non-admin access", async ({
    page,
  }) => {
    let pageContent;
    // 🛸 Navigate directly to the operator page (already tested navigating from the dashboard in the first test)
    const selectOperatorPage = new OperatorPOM(page);
    await selectOperatorPage.route();
    await selectOperatorPage.urlIsCorrect();
    await selectOperatorPage.selectByCraNumber("987654321");
    await expect(
      page.getByText(selectOperatorPage.confirmationMessage)
    ).toBeVisible();
    await selectOperatorPage.buttonYesThisIsMyOperator.click();
    await expect(
      page.getByText(/Looks like you do not have access to/i)
    ).toBeVisible();

    pageContent = page.locator("html");
    await happoPlaywright.screenshot(page, pageContent, {
      component: "Select operator existing admin message",
      variant: "default",
    });

    await selectOperatorPage.buttonRequestAccess.click();
    await expect(
      page.getByText(/Your access request has been sent/i)
    ).toBeVisible();

    pageContent = page.locator("html");
    await happoPlaywright.screenshot(page, pageContent, {
      component: "Select operator non-admin access request confirmation",
      variant: "default",
    });
  });

  test("Add a new operator", async ({ page }) => {
    let pageContent;
    // 🛸 Navigate directly to the operator page (already tested navigating from the dashboard in the first test)
    const selectOperatorPage = new OperatorPOM(page);
    await selectOperatorPage.route();
    await selectOperatorPage.urlIsCorrect();
    await selectOperatorPage.linkAddOperator.click();
    await expect(page.getByText(/Operator Information/i)).toBeVisible();

    pageContent = page.locator("html");
    await happoPlaywright.screenshot(page, pageContent, {
      component: "Add a new operator",
      variant: "default",
    });

    await selectOperatorPage.triggerValidationErrors();

    pageContent = page.locator("html");
    await happoPlaywright.screenshot(page, pageContent, {
      component: "Add a new operator",
      variant: "errors",
    });

    // Fill the form
    await fieldsUpdate(page);

    pageContent = page.locator("html");
    await happoPlaywright.screenshot(page, pageContent, {
      component: "Add a new operator",
      variant: "filled",
    });

    // Click the Submit button
    await selectOperatorPage.buttonSubmit.click();

    await expect(page.getByText(/Your request to add/i)).toBeVisible();

    pageContent = page.locator("html");
    await happoPlaywright.screenshot(page, pageContent, {
      component: "New operator confirmation",
      variant: "default",
    });
  });

  test("Go back and return navigation works", async ({ page }) => {
    // 🛸 Navigate directly to the operator page (already tested navigating from the dashboard in the first test)
    const selectOperatorPage = new OperatorPOM(page);
    await selectOperatorPage.route();
    await selectOperatorPage.urlIsCorrect();
    await selectOperatorPage.selectByCraNumber("987654321");
    await expect(
      page.getByText(selectOperatorPage.confirmationMessage)
    ).toBeVisible();
    await selectOperatorPage.buttonYesThisIsMyOperator.click();
    await expect(
      page.getByText(/Looks like you do not have access to/i)
    ).toBeVisible();
    await page.getByText(/go back/i).click();
    await expect(
      page.getByText(selectOperatorPage.confirmationMessage)
    ).toBeVisible();
    await page.getByText(/return/i).click();
    await expect(
      page.getByText(/Which operator would you like to log in to?/i)
    ).toBeVisible();
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
