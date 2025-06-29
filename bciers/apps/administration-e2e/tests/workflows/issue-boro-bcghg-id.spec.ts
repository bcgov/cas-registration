import { expect } from "@playwright/test";
import { setupBeforeAllTest } from "@bciers/e2e/setupBeforeAll";
import { UserRole } from "@bciers/e2e/utils/enums";
import {
  AppRoute,
  IDE2EValue,
  SnackbarMessages,
} from "@/administration-e2e/utils/enums";
import { OperationPOM } from "@/administration-e2e/poms/operation";
import {
  analyzeAccessibility,
  takeStabilizedScreenshot,
  assertSuccessfulSnackbar,
  clickButton,
  urlIsCorrect,
} from "@bciers/e2e/utils/helpers";

const happoPlaywright = require("happo-playwright");

// This is only used in the CI - since we have cas_director being used in dashboard.spec.ts, in order to not disrupt other PRs we'll use this first
const test = setupBeforeAllTest(UserRole.CAS_DIRECTOR_1);

// Use this locally
// const test = setupBeforeAllTest(UserRole.CAS_DIRECTOR);

// https://github.com/bcgov/cas-registration/issues/3445

// 🏷 Annotate test suite as serial so to use 1 worker- prevents failure in setupTestEnvironment
test.describe.configure({ mode: "serial" });
test.describe("Issue BCGHG and BORO ID", () => {
  test("Issue BCGHG and BORO ID", async ({ page }) => {
    // 🛸 Navigate to administration/operations
    const operationPage = new OperationPOM(page);
    await operationPage.route();
    await urlIsCorrect(page, AppRoute.OPERATIONS);

    // Search the operation page by exact operation and operator name
    const row = await operationPage.searchOperationByName(
      IDE2EValue.OPERATION_NAME,
      IDE2EValue.OPERATOR_NAME,
    );

    await operationPage.goToOperation(row);
    await expect(page.getByText(IDE2EValue.OPERATION_NAME)).toBeVisible();

    await takeStabilizedScreenshot(happoPlaywright, page, {
      component: "BORO ID and BCGHG ID not issued",
      variant: "default",
    });

    await clickButton(page, /issue bcghg id/i);

    await expect(page.getByText(IDE2EValue.EXPECTED_BCGHG_ID)).toBeVisible();
    await assertSuccessfulSnackbar(page, SnackbarMessages.ISSUED_BCGHG_ID);

    await clickButton(page, /issue boro id/i);

    await expect(page.getByText(IDE2EValue.EXPECTED_BORO_ID)).toBeVisible();
    await assertSuccessfulSnackbar(page, SnackbarMessages.ISSUED_BORO_ID);

    await takeStabilizedScreenshot(happoPlaywright, page, {
      component: "BORO ID and BCGHG ID issued",
      variant: "default",
    });
    await analyzeAccessibility(page);
  });
});
