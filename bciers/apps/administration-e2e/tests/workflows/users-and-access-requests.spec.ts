import { expect } from "@playwright/test";
import { setupBeforeAllTest } from "@bciers/e2e/setupBeforeAll";
import { UserRole } from "@bciers/e2e/utils/enums";
import {
  assertSuccessfulSnackbar,
  getRowByUniqueCellValue,
  linkIsVisible,
  openNewBrowserContextAs,
  takeStabilizedScreenshot,
} from "@bciers/e2e/utils/helpers";
import {
  AppRoute,
  MessageTextOperatorSelect,
  OperatorE2EValue,
  UserAccessRequestActions,
  UserAndAccessRequestGridHeaders,
  UserAndAccessRequestValues,
} from "@/administration-e2e/utils/enums";
import { UsersAccessRequestPOM } from "@/administration-e2e/poms/users-access-request";

import { upsertUserOperatorRecord } from "@bciers/e2e/utils/queries";
import { SecondaryUserOperatorFixtureFields } from "@/administration-e2e/utils/enums";
import { OperatorPOM } from "@/administration-e2e/poms/operator";

const test = setupBeforeAllTest(UserRole.INDUSTRY_USER_ADMIN);
test.beforeEach(async () => {
  /**
   * Upsert bc-cas-dev-secondary user operator as pending
   * Best not to set this in the fixtures so that we can test
   * Scenario where this user requests access to its operator
   */
  await upsertUserOperatorRecord(
    SecondaryUserOperatorFixtureFields.USER,
    SecondaryUserOperatorFixtureFields.ROLE_PENDING,
    SecondaryUserOperatorFixtureFields.STATUS_PENDING,
  );
});

// 🏷 Annotate test suite as serial so to use 1 worker- prevents failure in setupTestEnvironment
test.describe.configure({ mode: "serial" });
test.describe("External User", () => {
  // 🏷 Annotate test suite as serial so to use 1 worker- prevents failure in setupTestEnvironment
  test.describe.configure({ mode: "serial" });
  test.describe("External User", () => {
    test("Reject a request", async ({ page, browser, happoScreenshot }) => {
      // 🛸 Navigate to Users and Access Requests from dashboard
      const accessRequestPage = new UsersAccessRequestPOM(page);
      await accessRequestPage.goToUserAccessRequestPage();
      await accessRequestPage.pageIsStable();

      const row = await getRowByUniqueCellValue(
        page,
        UserAndAccessRequestGridHeaders.EMAIL.toLowerCase(),
        UserAndAccessRequestValues.EMAIL,
      );

      const role = await accessRequestPage.getCurrentRole(row);

      // Decline Request
      await accessRequestPage.approveOrDeclineRequest(
        row,
        role,
        UserAccessRequestActions.DECLINE,
      );
      await expect(row.getByText(role)).toBeHidden();
      await assertSuccessfulSnackbar(page, /is now declined/i);

      const currentStatus = await accessRequestPage.getCurrentStatus(row);
      await accessRequestPage.assertActionVisibility(row, currentStatus);

      await takeStabilizedScreenshot(happoScreenshot, page, {
        component: "EXTERNAL: Decline a user operator request",
        variant: "default",
      });

      // Create the new context using the browser fixture
      const newPage = await openNewBrowserContextAs(
        UserRole.INDUSTRY_USER,
        browser,
      );

      try {
        // Verify Select an operator is visible
        const selectOperatorPage = new OperatorPOM(newPage);
        await selectOperatorPage.route(AppRoute.OPERATOR_SELECT);
        await selectOperatorPage.urlIsCorrect(AppRoute.OPERATOR_SELECT);

        // 👉 Action search by legal name
        await selectOperatorPage.selectByLegalName(
          OperatorE2EValue.SEARCH_LEGAL_NAME,
          "Bravo Technologies - has parTNER operator - name from admin",
        );

        // Wait for client-side navigation
        await expect(selectOperatorPage.page).toHaveURL(
          /select-operator\/confirm/,
          { timeout: 30_000 },
        );

        await selectOperatorPage.msgRequestAccessDeclinedIsVisible();
        await linkIsVisible(
          selectOperatorPage.page,
          MessageTextOperatorSelect.SELECT_ANOTHER_OPERATOR,
          true,
        );

        // This is where the error usually occurs; we await it fully inside the try block
        await takeStabilizedScreenshot(happoScreenshot, newPage, {
          component: "Decline a user operator request",
          variant: "default",
        });
      } finally {
        // 🚨 CRITICAL: Close the page/context before the test ends.
        // This prevents the runner from detaching the frame while Happo is still talking to it.
        await newPage.close();
      }
    });
  });
});
