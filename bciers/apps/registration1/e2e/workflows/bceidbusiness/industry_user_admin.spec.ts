// 🧪 Suite to test the industry_user_admin workflows using storageState

import { test } from "@playwright/test";
// 🪄 Page Object Models
import { DashboardPOM } from "@/e2e/poms/dashboard";
import { OperationPOM } from "@/e2e/poms/operation";
import { OperationsPOM } from "@/e2e/poms/operations";
import { OperatorPOM } from "@/e2e/poms/operator";
import { UsersPOM } from "@/e2e/poms/users";
// 🛠️ Helpers
import {
  addPdf,
  analyzeAccessibility,
  clearTableFilter,
  filterTableByFieldId,
  setupTestEnvironment,
  sortTableByColumnLabel,
  tableRowCount,
} from "@/e2e/utils/helpers";
import * as dotenv from "dotenv";
dotenv.config({ path: "./e2e/.env.local" });
// ☰ Enums
import {
  ButtonText,
  OperationTableDataField,
  OperationTableHeaders,
  OperationStatus,
  UserOperatorStatus,
  UserRole,
  E2EValue,
} from "@/e2e/utils/enums";
import happoPlaywright from "happo-playwright";

test.beforeEach(async ({ context }) => {
  // initialize Happo
  await happoPlaywright.init(context);

  await setupTestEnvironment(UserRole.INDUSTRY_USER_ADMIN);
});

test.afterEach(async () => {
  await happoPlaywright.finish();
});

// 🏷 Annotate test suite as serial
test.describe.configure({ mode: "serial" });
test.describe("Test Workflow industry_user_admin", () => {
  // 👤 run test using the storageState for this role
  const storageState = JSON.parse(
    process.env.E2E_INDUSTRY_USER_ADMIN_STORAGE_STATE as string,
  );
  // Note: specify storageState for each test file or test group, instead of setting it in the config. https://playwright.dev/docs/next/auth#reuse-signed-in-state
  test.use({ storageState: storageState }); // this will error if no such file or directory

  test("Operators Tile view and edit operator workflow", async ({ page }) => {
    // 🛸 Navigate to operators tile page
    const dashboardPage = new DashboardPOM(page);
    const operatorPage = new OperatorPOM(page);
    // 🛸 Navigate to dashboard
    await dashboardPage.route();
    // 🔍 Assert tiles by role are correct
    await dashboardPage.dashboardTilesAreVisible(UserRole.INDUSTRY_USER_ADMIN);
    // 🛸 Navigates to operator
    await dashboardPage.clickOperatorsTileIndustry();
    // 🔍 Assert current URL is operator
    await operatorPage.urlIsCorrect();
    // 🔍 Assert the form looks correct
    await operatorPage.formViewIsCorrect();
    // 📷 Cheese!
    const pageContent = page.locator("html");
    await happoPlaywright.screenshot(operatorPage.page, pageContent, {
      component: "Operator Form Page",
      variant: "read only",
    });
    // ♿️ Analyze accessibility
    await analyzeAccessibility(page);
    // 🔍 Assert the form is default read-only
    await operatorPage.formIsDisabled();
    // 🔍 Assert industry_user_admin is able to edit the operator form
    await operatorPage.clickEditInformation();
    await operatorPage.formIsEnabled();
    // 👉 Action edit operator form field(s)
    await operatorPage.editOperatorInformation();
    // 📷 Cheese!
    await happoPlaywright.screenshot(operatorPage.page, pageContent, {
      component: "Operator Form Page",
      variant: "edit mode",
    });
    // ♿️ Analyze accessibility
    await analyzeAccessibility(page);
    // 🛸 Navigates to operator
    await operatorPage.clickSaveAndReturn();
    await page.waitForURL(dashboardPage.url);
    // 🔍 Assert that we have returned to the dashboard
    await dashboardPage.urlIsCorrect();
    await dashboardPage.dashboardTilesAreVisible(UserRole.INDUSTRY_USER_ADMIN);
  });

  test("Operations Tile Add Operation workflow", async ({ page }) => {
    const dashboardPage = new DashboardPOM(page);
    const operationPage = new OperationPOM(page);
    const operationsPage = new OperationsPOM(page);
    const pageContent = page.locator("html");
    // 🛸 Navigate to dashboard
    await dashboardPage.route();
    // 🛸 Navigates to operations tile page
    await dashboardPage.clickOperationsTileIndustry();
    // 🔍 Assert that the current URL is operations
    await operationsPage.urlIsCorrect();
    // 🔍 Assert `Operations` view, table and data reflect role `industry_user_admin`
    await operationsPage.tableIsVisible();
    await operationsPage.tableHasExpectedColumns(UserRole.INDUSTRY_USER_ADMIN);
    // 📷 Cheese!
    // Disabled due to flakiness - tech debt to resolve:
    // https://github.com/bcgov/cas-registration/issues/2181
    // await stabilizeGrid(page, 14);
    // await takeStabilizedScreenshot(happoPlaywright, operationPage.page, {
    //   component: "Operation grid",
    //   variant: UserRole.INDUSTRY_USER_ADMIN,
    //   targets: ["chrome", "firefox", "safari"], // this screenshot is flaky in edge
    // });
    //
    // ♿️ Analyze accessibility
    await analyzeAccessibility(page);
    // 🛸 Navigate to new operation form
    await operationsPage.clickAddOperationButton();
    // 🔍 Assert we are on the operation detail page 1
    await operationPage.formIsVisible();
    // 👉 Action fill page 1, take screenshot and click save and continue to move to the next step
    await operationPage.formFillPage1();
    // 📷 Cheese!
    await happoPlaywright.screenshot(operationPage.page, pageContent, {
      component: "Operation Form Page 1",
      variant: "filled",
    });
    // ♿️ Analyze accessibility
    await analyzeAccessibility(page);

    // 🛸 Navigates to next page
    await operationPage.clickSaveAndContinue();
    // 🔍 Assert we are on the operation detail page 2
    await operationPage.formStep2IsVisible();
    // 👉 Action fill page 2, take screenshot and click save and continue to move to the next step
    await operationPage.formFillPage2();
    // 📷 Cheese!
    await happoPlaywright.screenshot(operationPage.page, pageContent, {
      component: "Operation Form Page 2",
      variant: "filled",
    });
    // ♿️ Analyze accessibility
    await analyzeAccessibility(page);
    // 🛸 Navigates to next page
    await operationPage.clickSaveAndContinue();
    // 🔍 Assert we are on the operation detail page 3
    await operationPage.formStep3IsVisible();
    // 👉 Action fill page 3, take screenshot and click save and continue to move to the next step
    await addPdf(operationPage.page);
    // 📷 Cheese!
    await happoPlaywright.screenshot(operationPage.page, pageContent, {
      component: "Operation Form Page 3",
      variant: "filled",
    });
    // ♿️ Analyze accessibility
    await analyzeAccessibility(page);
    // 🛸 Navigates to next page
    await operationPage.clickSubmitButton();
    // 🔍 Assert that the submission was successful and take a screenshot
    await operationPage.successfulSubmissionIsVisible();
    // 📷 Cheese!
    await happoPlaywright.screenshot(operationPage.page, pageContent, {
      component: "Operation Form Submission Successful",
      variant: "default",
    });

    await analyzeAccessibility(page);

    // check that the newly created operation is visible
    await operationsPage.route();
    await operationsPage.urlIsCorrect();
    await operationsPage.tableIsVisible();
    await operationsPage.clickViewDetailsButtonByOperationName(
      page,
      E2EValue.INPUT_OPERATION_NAME,
    );
    await operationPage.formIsVisible();
  });

  test("Operations Tile View Details workflow", async ({ page }) => {
    const operationPage = new OperationPOM(page);
    const operationsPage = new OperationsPOM(page);
    const pageContent = page.locator("html");
    // 🛸 Navigate to operations table page
    await operationsPage.route();
    // 🔍 Assert that the current URL is operations
    await operationsPage.urlIsCorrect();
    // 🔍 Assert `Operations` view, table reflect role `industry_user_admin`
    await operationsPage.tableIsVisible();
    await operationsPage.tableHasExpectedColumns(UserRole.INDUSTRY_USER_ADMIN);
    // 🛸 Navigate to an operation with pending status
    await operationsPage.clickViewDetailsButtonByOperationName(
      page,
      "Operation 20",
    );
    // 🔍 Assert we are on the operation detail page
    await operationPage.formIsVisible();
    // 📷 Cheese!
    await happoPlaywright.screenshot(operationPage.page, pageContent, {
      component: "Operation Form Page 1",
      variant: "read only",
    });
    // ♿️ Analyze accessibility
    await analyzeAccessibility(page);
    // 🛸 Navigate to next page
    await operationPage.clickNextButton();
    // 🔍 Assert that we are on the operation detail page step 2
    await operationPage.formStep2IsVisible();
    // 🛸 Navigate to next page
    await operationPage.clickNextButton();
    // 🔍 Assert that we are on the operation detail page step 3
    await operationPage.formStep3IsVisible();
    // 🛸 Navigate to back page
    await operationPage.clickCancelButton();
    // 🔍 Assert that we have returned to the operations table
    await operationsPage.tableIsVisible();
  });

  test("User Access Management Tile workflow - Approve and Decline users", async ({
    page,
  }) => {
    const dashboardPage = new DashboardPOM(page);
    const userPage = new UsersPOM(page);
    // 🛸 Navigate to dashboard
    await dashboardPage.route();
    // 🛸 Navigates to user access management tile page
    await dashboardPage.clickUserAccessManagementTileIndustry();
    // 🔍 Assert that the current URL is users
    await userPage.urlIsCorrect();
    // 🔍 Assert that table is visible
    await userPage.tableIsVisible();
    // 🔍 Assert industry_admin is able to view User Access Management table with the following columns
    await userPage.tableHasExpectedColumns(UserRole.INDUSTRY_USER_ADMIN);
    // 👉  Action Approve "Pending" user
    let rowId = await userPage.approveOrDeclineUser(ButtonText.APPROVE);
    // 🔍 Assert updated row is Approved
    await userPage.rowHasCorrectStatusValue(rowId, UserOperatorStatus.APPROVED);
    // 👉 Action Undo user status change
    await userPage.undoUserStatusChange(rowId);
    // 🔍 Assert updated row is Pending
    await userPage.rowHasCorrectStatusValue(rowId, UserOperatorStatus.PENDING);
    // 👉 Action Deny "Pending" user
    rowId = await userPage.approveOrDeclineUser(ButtonText.DECLINE);
    // 🔍 Assert updated row is Declined
    await userPage.rowHasCorrectStatusValue(rowId, UserOperatorStatus.DECLINED);
    // 👉 Action Undo user status change
    await userPage.undoUserStatusChange(rowId);
    // 🔍 Assert updated row is Pending
    await userPage.rowHasCorrectStatusValue(rowId, UserOperatorStatus.PENDING);
    // 📷 Cheese!
    // Disabled due to flakiness - tech debt to resolve:
    // https://github.com/bcgov/cas-registration/issues/2181
    // const pageContent = page.locator("html");
    // await happoPlaywright.screenshot(userPage.page, pageContent, {
    //   component: "User Access Management",
    //   variant: UserRole.INDUSTRY_USER_ADMIN,
    // });
    // ♿️ Analyze accessibility
    await analyzeAccessibility(page);
  });

  test("Operations table sorting", async ({ page }) => {
    const operationsPage = new OperationsPOM(page);
    // 🛸 Navigate to operations table page
    await operationsPage.route();
    // 🔍 Assert that the current URL is operations
    await operationsPage.urlIsCorrect();
    // 🔍 Assert `Operations` view, table reflect role `industry_user_admin`
    await operationsPage.tableIsVisible();
    await operationsPage.tableHasExpectedColumns(UserRole.INDUSTRY_USER_ADMIN);

    // 👉 Action sort by column
    await sortTableByColumnLabel(
      operationsPage.page,
      OperationTableHeaders.BCGHG_ID,
      "23219990001",
    );

    await sortTableByColumnLabel(
      operationsPage.page,
      OperationTableHeaders.BCGHG_ID,
      "23219990023",
      "descending",
    );

    await sortTableByColumnLabel(
      operationsPage.page,
      OperationTableHeaders.STATUS,
      OperationStatus.APPROVED,
    );

    await sortTableByColumnLabel(
      operationsPage.page,
      OperationTableHeaders.SUBMISSION_DATE,
      "Dec 16, 2023\n7:27:00 a.m. PST",
    );

    await sortTableByColumnLabel(
      operationsPage.page,
      OperationTableHeaders.SUBMISSION_DATE,
      "Not Started",
      "descending",
    );
  });

  test("Operations table filtering", async ({ page }) => {
    const operationsPage = new OperationsPOM(page);
    // 🛸 Navigate to operations table page
    await operationsPage.route();
    // 🔍 Assert that the current URL is operations
    await operationsPage.urlIsCorrect();
    // 🔍 Assert `Operations` view, table reflect role `industry_user_admin`
    await operationsPage.tableIsVisible();
    await operationsPage.tableHasExpectedColumns(UserRole.INDUSTRY_USER_ADMIN);

    // 👉 Action filter by column
    await filterTableByFieldId(
      operationsPage.page,
      OperationTableDataField.BCGHG_ID,
      OperationTableHeaders.BCGHG_ID,
      "23219990001",
    );

    await tableRowCount(operationsPage.page, 1);

    await clearTableFilter(
      operationsPage.page,
      OperationTableDataField.BCGHG_ID,
    );

    await filterTableByFieldId(
      operationsPage.page,
      OperationTableDataField.STATUS,
      OperationTableHeaders.STATUS,
      OperationStatus.PENDING,
    );

    await tableRowCount(operationsPage.page, 5);

    await clearTableFilter(operationsPage.page, OperationTableDataField.STATUS);

    await filterTableByFieldId(
      operationsPage.page,
      OperationTableDataField.OPERATION,
      OperationTableHeaders.OPERATION,
      "Operation 2",
    );

    await tableRowCount(operationsPage.page, 6);

    await clearTableFilter(
      operationsPage.page,
      OperationTableDataField.OPERATION,
    );

    // Check junk search
    await filterTableByFieldId(
      operationsPage.page,
      OperationTableDataField.OPERATION,
      OperationTableHeaders.OPERATION,
      "this search will return no results",
      true,
    );
  });

  test.skip("Operations table sorting and filtering", async ({ page }) => {
    const operationsPage = new OperationsPOM(page);
    // 🛸 Navigate to operations table page
    await operationsPage.route();
    // 🔍 Assert that the current URL is operations
    await operationsPage.urlIsCorrect();
    // 🔍 Assert `Operations` view, table reflect role `industry_user_admin`
    await operationsPage.tableIsVisible();
    await operationsPage.tableHasExpectedColumns(UserRole.INDUSTRY_USER_ADMIN);

    // 👉 Action filter by column
    await filterTableByFieldId(
      operationsPage.page,
      OperationTableDataField.STATUS,
      OperationTableHeaders.STATUS,
      OperationStatus.PENDING,
    );

    await filterTableByFieldId(
      operationsPage.page,
      OperationTableDataField.BCGHG_ID,
      OperationTableHeaders.BCGHG_ID,
      "2321999001",
    );

    await tableRowCount(operationsPage.page, 1);

    await sortTableByColumnLabel(
      operationsPage.page,
      OperationTableHeaders.SUBMISSION_DATE,
      "Jan 28, 2024\n7:27:00 a.m. PST",
    );

    await filterTableByFieldId(
      operationsPage.page,
      OperationTableDataField.OPERATION,
      OperationTableHeaders.OPERATION,
      "Operation 2",
    );

    await tableRowCount(operationsPage.page, 1);
  });
});
