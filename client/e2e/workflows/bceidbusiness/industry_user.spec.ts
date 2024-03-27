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
import { baseUrlSetup } from "@/e2e/utils/constants";
import { E2EValue, MessageTexResponse } from "@/e2e/utils/enums";
dotenv.config({ path: "./e2e/.env.local" });
const happoPlaywright = require("happo-playwright");

test.beforeEach(async ({ context }) => {
  await happoPlaywright.init(context);
  let response: APIResponse = await context.request.get(baseUrlSetup);
  // Wait for the response and check for success status text and code (e.g., 200)
  expect(await response.text()).toBe(MessageTexResponse.SETUP_SUCCESS);
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
    // 🔍 Assert current URL
    await dashboardPage.urlIsCorrect();
    // 🛸 Navigates to select operator
    await dashboardPage.clickSelectOperatorTile();
    // 🔍 Assert current URL
    await selectOperatorPage.urlIsCorrect();

    pageContent = page.locator("html");
    await happoPlaywright.screenshot(page, pageContent, {
      component: "Select operator page",
      variant: "default",
    });

    // Action search by legal name
    await selectOperatorPage.selectByLegalName(
      E2EValue.INPUT_LEGAL_NAME,
      E2EValue.FIXTURE_LEGAL_NAME,
    );
    // 🔍 Assert operator confirmation message
    await selectOperatorPage.msgConfirmationIsVisible();

    pageContent = page.locator("html");
    await happoPlaywright.screenshot(page, pageContent, {
      component: "Select operator confirmation message",
      variant: "default",
    });

    // Action accept operator
    await selectOperatorPage.acceptOperator();
    // 🔍 Assert no administrator set up message
    await selectOperatorPage.msgNoAdminSetupIsVisible();

    pageContent = page.locator("html");
    await happoPlaywright.screenshot(page, pageContent, {
      component: "Select operator no administrator message",
      variant: "default",
    });

    // Action request administrator access
    await selectOperatorPage.requestAdmin();
    // 🔍 Assert access requested message
    await selectOperatorPage.msgAdminRequestedIsVisible();

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
    // 🔍 Assert current URL
    await selectOperatorPage.urlIsCorrect();

    // Action select by CRA
    await selectOperatorPage.selectByCraNumber(E2EValue.INPUT_CRA);
    // 🔍 Assert operator confirmation message
    await selectOperatorPage.msgConfirmationIsVisible();

    // Action accept operator
    await selectOperatorPage.acceptOperator();
    // 🔍 Assert no access message
    await selectOperatorPage.msgNoAccessIsVisible();

    pageContent = page.locator("html");
    await happoPlaywright.screenshot(page, pageContent, {
      component: "Select operator existing admin message",
      variant: "default",
    });

    // Action request access
    await selectOperatorPage.requestAccess();
    // 🔍 Assert access requested message
    await selectOperatorPage.msgAccessRequestedIsVisible();

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

    // Add short timeout to mitigate the Firefox text rendering issue causing spurious screenshot failures
    await page.waitForTimeout(500);

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
    // 🔍 Assert current URL
    await selectOperatorPage.urlIsCorrect();

    // Action select by CRA
    await selectOperatorPage.selectByCraNumber(E2EValue.INPUT_CRA);
    // 🔍 Assert operator confirmation message
    await selectOperatorPage.msgConfirmationIsVisible();

    // Action accept operator
    await selectOperatorPage.acceptOperator();
    // 🔍 Assert no access message
    await selectOperatorPage.msgNoAccessIsVisible();

    // Action route go back
    await selectOperatorPage.routeBack();
    // 🔍 Assert operator confirmation message
    await selectOperatorPage.msgConfirmationIsVisible();

    // Action route return
    await selectOperatorPage.routeReturn();
    // 🔍 Assert operator confirmation message
    await selectOperatorPage.msgSelectOpertorIsVisible();
  });
});
