import { expect } from "@playwright/test";
import { setupBeforeAllTest } from "@bciers/e2e/setupBeforeAll";
import { UserRole } from "@bciers/e2e/utils/enums";
import {
  IssueIDValues,
  SnackbarMessages,
} from "@/administration-e2e/utils/enums";
import { OperationPOM } from "@/administration-e2e/poms/operation";
import {
  analyzeAccessibility,
  takeStabilizedScreenshot,
  assertSuccessfulSnackbar,
  clickButton,
  stabilizeGrid,
} from "@bciers/e2e/utils/helpers";
const happoPlaywright = require("happo-playwright");
const test = setupBeforeAllTest(UserRole.CAS_DIRECTOR);

// Task: https://github.com/bcgov/cas-registration/issues/3445

// 🏷 Annotate test suite as serial so to use 1 worker- prevents failure in setupTestEnvironment
test.describe.configure({ mode: "serial" });
test.describe("Issue BCGHG and BORO ID", () => {
  test("Issue BCGHG ID", async ({ page }) => {
    // 🛸 Navigate to administration/operations
    const operationPage = new OperationPOM(page);
    await operationPage.route();
    await operationPage.urlIsCorrect();

    // Search the operation page by exact operation name
    await operationPage.searchOperationByName(IssueIDValues.OPERATION_NAME);
    await stabilizeGrid(page, 1);

    await operationPage.goToOperation(IssueIDValues.OPERATION_NAME);

    await clickButton(page, /issue bcghg id/i);

    await expect(page.getByText(IssueIDValues.EXPECTED_BCGHG_ID)).toBeVisible();
    await assertSuccessfulSnackbar(page, SnackbarMessages.ISSUED_BCGHG_ID);
  });

  test("Issue BORO ID", async ({ page }) => {
    const operationPage = new OperationPOM(page);
    await operationPage.route();
    await operationPage.urlIsCorrect();

    // Search the operation page by exact operation name
    await operationPage.searchOperationByName(IssueIDValues.OPERATION_NAME);
    await stabilizeGrid(page, 1);

    await operationPage.goToOperation(IssueIDValues.OPERATION_NAME);

    await clickButton(page, /issue boro id/i);

    await expect(page.getByText(IssueIDValues.EXPECTED_BORO_ID)).toBeVisible();
    await assertSuccessfulSnackbar(page, SnackbarMessages.ISSUED_BORO_ID);

    await takeStabilizedScreenshot(happoPlaywright, page, {
      component: "CAS Director - Issue BORO and BCGHG ID",
      variant: "default",
    });
    await analyzeAccessibility(page);
  });
});
