// 🧪 Suite to test the bceidbusiness new user workflow using storageState

import { test } from "@playwright/test";
// 🪄 Page Object Models
import { DashboardPOM } from "@/e2e/poms/dashboard";
import { OperationPOM } from "@/e2e/poms/operation";
import { OperationsPOM } from "@/e2e/poms/operations";
import { OperatorPOM } from "@/e2e/poms/operator";
// 🛠️ Helpers
import { tableColumnNamesAreCorrect } from "@/e2e/utils/helpers";
import * as dotenv from "dotenv";
dotenv.config({ path: "./e2e/.env.local" });

// 🏷 Annotate test suite as serial
test.describe.configure({ mode: "serial" });
test.describe("Test Workflow industry_user_admin", () => {
  // 👤 run test using the storageState for this role
  const storageState = JSON.parse(
    process.env.E2E_INDUSTRY_USER_ADMIN_STORAGE as string,
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

  test("Operators Tile view and edit operator workflow", async ({ page }) => {
    // 🛸 Navigate to operators tile page
    const dashboardPage = new DashboardPOM(page);
    const operatorPage = new OperatorPOM(page);
    await dashboardPage.route();

    // Click Operator tile and view the Operator form
    await dashboardPage.clickOperatorsTileIndustry();
    await operatorPage.urlIsCorrect();
    await operatorPage.operatorViewIsCorrect();

    // industry_user_admin is able to view read only user operator form
    await operatorPage.operatorFormIsDisabled();

    // industry_user_admin is able to edit the operator form
    await operatorPage.clickEditInformation();
    await operatorPage.editOperatorInformation();
    await operatorPage.clickSaveAndReturn();

    // TODO: Figure out why this timeout is required
    await page.waitForTimeout(2000);
    await dashboardPage.dashboardTilesAreVisibleIndustryAdmin();

    // Verify that we have returned to the dashboard
    await dashboardPage.urlIsCorrect();
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
    await operationsPage.operationsTableIsVisible();

    // industry_admin is able to view operations table with the following columns
    await tableColumnNamesAreCorrect(operationsPage.page, [
      "BC GHG ID",
      "Operation",
      "Submission Date",
      "BORO ID",
      "Application Status",
      "Action",
    ]);

    // commenting this out as it breaks if we re-run the test locally due to status changes
    // await operationsPage.operationsViewIsCorrect(UserRole.INDUSTRY_USER_ADMIN, [
    //   "Not Started",
    //   "Approved",
    //   "Draft",
    //   "Pending",
    //   "Pending",
    //   "Pending",
    //   "Pending",
    //   "Pending",
    //   "Pending",
    //   "Pending",
    //   "Pending",
    //   "Pending",
    //  "Pending",
    //   "Pending",
    // ]);

    // industry_user_admin is able to click the Add Operation button
    await operationsPage.clickAddOperationButton();

    // Verify that we are on the operation detail page
    await operationPage.operationFormIsVisible();

    // Fill page 1 and click save and continue to move to the next step
    await operationPage.fillOperationFormPage1();
    await operationPage.clickSaveAndContinue();
    await operationPage.operationFormStep2IsVisible();

    // Fill page 2 and click save and continue to move to the next step
    await operationPage.fillOperationFormPage2();
    await operationPage.clickSaveAndContinue();
    await operationPage.operationFormStep3IsVisible();

    // Fill page 3 and click save and continue to move to the next step
    await operationPage.addFile();
    await operationPage.clickSubmitButton();

    // Verify that the submission was successful
    await operationPage.operationSuccessfulSubmissionIsVisible();
    await operationPage.clickReturnToOperationsList();

    // Verify that we have returned to the operations table
  });

  test("Operations Tile View Details workflow", async ({ page }) => {
    // 🛸 Navigate to operations tile page
    const dashboardPage = new DashboardPOM(page);
    const operationPage = new OperationPOM(page);
    const operationsPage = new OperationsPOM(page);
    await dashboardPage.route();

    // Click Operations tile and view the Operations form
    await dashboardPage.clickOperationsTileIndustry();
    await operationsPage.urlIsCorrect();
    await operationsPage.operationsTableIsVisible();

    // industry_admin is able to view operations table with the following columns
    await tableColumnNamesAreCorrect(operationsPage.page, [
      "BC GHG ID",
      "Operation",
      "Submission Date",
      "BORO ID",
      "Application Status",
      "Action",
    ]);

    // industry_user_admin is able to click the View Details button
    await operationsPage.clickViewDetailsButton();

    // Verify that we are on the operation detail page
    await operationPage.operationFormIsVisible();
    await operationPage.clickNextButton();

    // Verify that we are on the operation detail page step 2
    await operationPage.operationFormStep2IsVisible();
    await operationPage.clickNextButton();

    // Verify that we are on the operation detail page step 3
    await operationPage.operationFormStep3IsVisible();
    await operationPage.clickCancelButton();

    // Verify that we have returned to the operations table
    await operationsPage.operationsTableIsVisible();
  });
});
