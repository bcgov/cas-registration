// 🧪 Suite to test the bceidbusiness new user workflow using storageState
// 🔍 Asserts new user is redirected to profile

import { test, expect, APIResponse } from "@playwright/test";
// 🪄 Page Object Models
import { DashboardPOM } from "@/e2e/poms/dashboard";
// ℹ️ Environment variables
import * as dotenv from "dotenv";
import { OperatorPOM } from "@/e2e/poms/operator";
import {
  fillAllFormFields,
  checkRequiredFieldValidationErrors,
  triggerFormatValidationErrors,
} from "@/e2e/utils/helpers";
import { deleteUserOperatorRecord } from "@/e2e/utils/queries";
dotenv.config({ path: "./e2e/.env.local" });
const happoPlaywright = require("happo-playwright");

test.beforeEach(async ({ context }) => {
  await happoPlaywright.init(context);
  let response: APIResponse = await context.request.get(
    "http://localhost:8000/api/registration/test-setup",
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
    process.env.E2E_INDUSTRY_USER_STORAGE as string,
  );
  // Note: specify storageState for each test file or test group, instead of setting it in the config. https://playwright.dev/docs/next/auth#reuse-signed-in-state
  test.use({ storageState: storageState }); // this will error if no such file or directory

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
    await selectOperatorPage.buttonSelectOperator.click();
    await expect(
      page.getByText(selectOperatorPage.confirmationMessage),
    ).toBeVisible();

    pageContent = page.locator("html");
    await happoPlaywright.screenshot(page, pageContent, {
      component: "Select operator confirmation message",
      variant: "default",
    });

    await selectOperatorPage.buttonYesThisIsMyOperator.click();
    await expect(
      page.getByText(/does not have Administrator access set up./i),
    ).toBeVisible();

    pageContent = page.locator("html");
    await happoPlaywright.screenshot(page, pageContent, {
      component: "Select operator no administrator message",
      variant: "default",
    });

    await selectOperatorPage.buttonRequestAdministratorAccess.click();
    await expect(
      page.getByText(/has been received and will be reviewed./i),
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
      page.getByText(selectOperatorPage.confirmationMessage),
    ).toBeVisible();
    await selectOperatorPage.buttonYesThisIsMyOperator.click();
    await expect(
      page.getByText(/Looks like you do not have access to/i),
    ).toBeVisible();

    pageContent = page.locator("html");
    await happoPlaywright.screenshot(page, pageContent, {
      component: "Select operator existing admin message",
      variant: "default",
    });

    await selectOperatorPage.buttonRequestAccess.click();
    await expect(
      page.getByText(/Your access request has been sent/i),
    ).toBeVisible();

    pageContent = page.locator("html");
    await happoPlaywright.screenshot(page, pageContent, {
      component: "Select operator non-admin access request confirmation",
      variant: "default",
    });
  });

  test("Add a new operator with parent operators", async ({ page }) => {
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

    await checkRequiredFieldValidationErrors(
      page,
      selectOperatorPage.buttonSubmit,
    );

    pageContent = page.locator("html");
    await happoPlaywright.screenshot(page, pageContent, {
      component: "Add a new operator",
      variant: "required errors",
    });

    await triggerFormatValidationErrors(page, selectOperatorPage.buttonSubmit);

    pageContent = page.locator("html");
    await happoPlaywright.screenshot(page, pageContent, {
      component: "Add a new operator",
      variant: "format errors",
    });

    // Fill all operator form fields
    await fillAllFormFields(page, "fieldset#root");
    // Add a parent operator
    await page.locator("#root_operator_has_parent_operators-0").check();

    // Fill the parent operator form
    await fillAllFormFields(page, "fieldset#root_parent_operators_array_0");

    // Add a second parent operator
    await page.locator("#root_operator_has_parent_operators-1").check();

    // Fill the second parent operator form
    await fillAllFormFields(page, "fieldset#root_parent_operators_array_0");

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
      page.getByText(selectOperatorPage.confirmationMessage),
    ).toBeVisible();
    await selectOperatorPage.buttonYesThisIsMyOperator.click();
    await expect(
      page.getByText(/Looks like you do not have access to/i),
    ).toBeVisible();
    await page.getByText(/go back/i).click();
    await expect(
      page.getByText(selectOperatorPage.confirmationMessage),
    ).toBeVisible();
    await page.getByText(/return/i).click();
    await expect(
      page.getByText(/Which operator would you like to log in to?/i),
    ).toBeVisible();
  });
});
