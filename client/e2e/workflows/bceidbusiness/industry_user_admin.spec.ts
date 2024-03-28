// 🧪 Suite to test the bceidbusiness new user workflow using storageState

import { expect, test, APIResponse } from "@playwright/test";
// 🪄 Page Object Models
import { DashboardPOM } from "@/e2e/poms/dashboard";
import { OperationPOM } from "@/e2e/poms/operation";
import { OperationsPOM } from "@/e2e/poms/operations";
import { OperatorPOM } from "@/e2e/poms/operator";
import { UsersPOM } from "@/e2e/poms/users";
// 🛠️ Helpers
import {
  addPdf,
  setupTestEnvironment,
  tableColumnNamesAreCorrect,
} from "@/e2e/utils/helpers";
import * as dotenv from "dotenv";
dotenv.config({ path: "./e2e/.env.local" });
// ☰ Enums
import { UserOperatorStatus, UserRole } from "@/e2e/utils/enums";
import happoPlaywright from "happo-playwright";

test.beforeEach(async ({ context }) => {
  // initialize Happo
  await happoPlaywright.init(context);

  await setupTestEnvironment(UserRole.CAS_ADMIN);
});

test.afterEach(async () => {
  await happoPlaywright.finish();
});

// 🏷 Annotate test suite as serial
test.describe.configure({ mode: "serial" });
test.describe("Test Workflow industry_user_admin", () => {
  // 👤 run test using the storageState for this role
  const storageState = JSON.parse(
    process.env.E2E_INDUSTRY_USER_ADMIN_STORAGE as string,
  );
  // Note: specify storageState for each test file or test group, instead of setting it in the config. https://playwright.dev/docs/next/auth#reuse-signed-in-state
  test.use({ storageState: storageState }); // this will error if no such file or directory

  test("Operators Tile view and edit operator workflow", async ({ page }) => {
    // 🛸 Navigate to operators tile page
    const dashboardPage = new DashboardPOM(page);
    const operatorPage = new OperatorPOM(page);
    await dashboardPage.route();
    await dashboardPage.urlIsCorrect();
    await dashboardPage.dashboardTilesAreVisibleIndustryAdmin();

    // Click Operator tile and view the Operator form
    await dashboardPage.clickOperatorsTileIndustry();
    await operatorPage.urlIsCorrect();
    await operatorPage.operatorViewIsCorrect();

    const pageContent = page.locator("html");
    await happoPlaywright.screenshot(operatorPage.page, pageContent, {
      component: "Operator Form Page",
      variant: "read only",
    });

    // industry_user_admin is able to view read only user operator form
    await operatorPage.operatorFormIsDisabled();

    // industry_user_admin is able to edit the operator form
    await operatorPage.clickEditInformation();
    await operatorPage.operatorFormIsEnabled();
    await operatorPage.editOperatorInformation();

    await happoPlaywright.screenshot(operatorPage.page, pageContent, {
      component: "Operator Form Page",
      variant: "edit mode",
    });

    await operatorPage.clickSaveAndReturn();

    await page.waitForURL(dashboardPage.url);
    // Verify that we have returned to the dashboard
    await dashboardPage.urlIsCorrect();

    await dashboardPage.dashboardTilesAreVisibleIndustryAdmin();
  });

  test("Operations Tile Add Operation workflow", async ({ page }) => {
    // 🛸 Navigate to operations tile page
    const dashboardPage = new DashboardPOM(page);
    const operationPage = new OperationPOM(page);
    const operationsPage = new OperationsPOM(page);
    await dashboardPage.route();

    // Click Operations tile and view the Operations form
    await dashboardPage.clickOperationsTileIndustry();
    await operationsPage.urlIsCorrect();
    await operationsPage.tableIsVisible();
    await operationsPage.tableHasExpectedColumns(UserRole.INDUSTRY_USER_ADMIN);

    const pageContent = page.locator("html");
    await happoPlaywright.screenshot(operationPage.page, pageContent, {
      component: "Operation table",
      variant: UserRole.INDUSTRY_USER_ADMIN,
    });

    // industry_user_admin is able to click the Add Operation button
    await operationsPage.clickAddOperationButton();

    // Verify that we are on the operation detail page
    await operationPage.operationFormIsVisible();

    // Fill page 1, take screenshot and click save and continue to move to the next step
    await operationPage.fillOperationFormPage1();

    await happoPlaywright.screenshot(operationPage.page, pageContent, {
      component: "Operation Form Page 1",
      variant: "filled",
    });

    await operationPage.clickSaveAndContinue();
    await operationPage.operationFormStep2IsVisible();

    // Fill page 2, take screenshot and click save and continue to move to the next step
    await operationPage.fillOperationFormPage2();
    await happoPlaywright.screenshot(operationPage.page, pageContent, {
      component: "Operation Form Page 2",
      variant: "filled",
    });

    await operationPage.clickSaveAndContinue();
    await operationPage.operationFormStep3IsVisible();

    // Fill page 3, take screenshot and click save and continue to move to the next step
    await addPdf(operationPage.page);
    await happoPlaywright.screenshot(operationPage.page, pageContent, {
      component: "Operation Form Page 3",
      variant: "filled",
    });

    await operationPage.clickSubmitButton();

    // Verify that the submission was successful and take a screenshot
    await operationPage.operationSuccessfulSubmissionIsVisible();
    await happoPlaywright.screenshot(operationPage.page, pageContent, {
      component: "Operation Form Submission Successful",
      variant: "default",
    });
  });

  test("Operations Tile View Details workflow", async ({ page }) => {
    const operationPage = new OperationPOM(page);
    const operationsPage = new OperationsPOM(page);

    // Navigate to operations table page
    await operationsPage.route();
    await operationsPage.urlIsCorrect();
    // 🧪 `Operations` view, table and data reflect role `industry_user_admin`
    await operationsPage.tableIsVisible();
    await operationsPage.tableHasExpectedColumns(UserRole.INDUSTRY_USER_ADMIN);

    // industry_user_admin is able to click the View Details button
    // Click the second view details button for an operation with pending status
    await operationsPage.clickViewDetailsButton(1);

    // Verify that we are on the operation detail page
    await operationPage.operationFormIsVisible();
    const pageContent = page.locator("html");
    await happoPlaywright.screenshot(operationPage.page, pageContent, {
      component: "Operation Form Page 1",
      variant: "read only",
    });

    await operationPage.clickNextButton();

    // Verify that we are on the operation detail page step 2
    await operationPage.operationFormStep2IsVisible();
    await operationPage.clickNextButton();

    // Verify that we are on the operation detail page step 3
    await operationPage.operationFormStep3IsVisible();
    await operationPage.clickCancelButton();

    // Verify that we have returned to the operations table
    await operationsPage.tableIsVisible();
  });

  test("User Access Management Tile workflow - Approve and Decline users", async ({
    page,
  }) => {
    // 🛸 Navigate to user access management tile page
    const dashboardPage = new DashboardPOM(page);
    const userPage = new UsersPOM(page);
    await dashboardPage.route();
    await dashboardPage.urlIsCorrect();
    await dashboardPage.dashboardTilesAreVisibleIndustryAdmin();

    // Click User Access Management tile and view the User Access Management form
    await dashboardPage.clickUserAccessManagementTileIndustry();
    await userPage.urlIsCorrect();

    // industry_admin is able to view User Access Management table with the following columns
    await tableColumnNamesAreCorrect(userPage.page, [
      "Name",
      "Email",
      "BCeID Business",
      "Access Type",
      "Status",
      "Actions",
    ]);

    // Approve user
    await userPage.approveOrDeclineUser(UserOperatorStatus.APPROVED, 2);

    // Undo user status change - doing this so we can re-run test locally with no errors
    await userPage.undoUserStatusChange(UserOperatorStatus.APPROVED, 2);

    // Decline user
    await userPage.approveOrDeclineUser(UserOperatorStatus.DECLINED, 2);

    //  Undo user status change - doing this so we can re-run test locally with no errors
    await userPage.undoUserStatusChange(UserOperatorStatus.DECLINED, 2);

    const pageContent = page.locator("html");
    await happoPlaywright.screenshot(userPage.page, pageContent, {
      component: "User Access Management",
      variant: UserRole.INDUSTRY_USER_ADMIN,
    });
  });
});
