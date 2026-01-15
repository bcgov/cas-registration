import { expect } from "@playwright/test";
import { setupBeforeAllTest } from "@bciers/e2e/setupBeforeAll";
import { UserRole } from "@bciers/e2e/utils/enums";
import {
  assertSuccessfulSnackbar,
  getRowByUniqueCellValue,
  openNewBrowserContextAs,
  takeStabilizedScreenshot,
} from "@bciers/e2e/utils/helpers";
import {
  UserAccessRequestActions,
  UserAccessRequestRoles,
  UserAndAccessRequestGridHeaders,
  UserAndAccessRequestValues,
} from "@/administration-e2e/utils/enums";
import { UsersAccessRequestPOM } from "@/administration-e2e/poms/users-access-request";
import { DashboardPOM } from "@/dashboard-e2e/poms/dashboard";
import { AdministrationTileText } from "@/dashboard-e2e/utils/enums";
import { upsertUserOperatorRecord } from "@bciers/e2e/utils/queries";
import { SecondaryUserOperatorFixtureFields } from "@/administration-e2e/utils/enums";

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
  test("Approve a reporter", async ({ page, happoScreenshot }) => {
    // 🤣🛸 Navigate to Users and Access Requests from dashboard
    const accessRequestPage = new UsersAccessRequestPOM(page);
    await accessRequestPage.goToUserAccessRequestPage();
    await accessRequestPage.pageIsStable();

    // Get specific row that has the unique email
    const row = await getRowByUniqueCellValue(
      page,
      UserAndAccessRequestGridHeaders.EMAIL.toLowerCase(),
      UserAndAccessRequestValues.EMAIL,
    );
    await expect(row).toBeVisible();
    const currentStatus = await accessRequestPage.getCurrentStatus(row);
    await accessRequestPage.assertActionVisibility(row, currentStatus);

    const role = UserAccessRequestRoles.REPORTER;
    await accessRequestPage.approveOrDeclineRequest(
      row,
      role,
      UserAccessRequestActions.APPROVE,
    );
    await assertSuccessfulSnackbar(page, /is now approved/i);

    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "EXTERNAL: Approve a reporter",
      variant: "filled",
    });

    const newPage = await openNewBrowserContextAs(UserRole.INDUSTRY_USER);

    const dashboardPage = new DashboardPOM(newPage);
    await dashboardPage.route();
    await expect(
      newPage.getByRole("link", {
        name: AdministrationTileText.ACCESS_REQUEST,
      }),
    ).toBeHidden();
  });

  test("Approve an administrator", async ({ page, happoScreenshot }) => {
    // 🛸 Navigate to Users and Access Requests from dashboard
    const accessRequestPage = new UsersAccessRequestPOM(page);
    await accessRequestPage.goToUserAccessRequestPage();
    await accessRequestPage.pageIsStable();

    const row = await getRowByUniqueCellValue(
      page,
      UserAndAccessRequestGridHeaders.EMAIL.toLowerCase(),
      UserAndAccessRequestValues.EMAIL,
    );

    const currentStatus = await accessRequestPage.getCurrentStatus(row);
    await accessRequestPage.assertActionVisibility(row, currentStatus);

    const role = UserAccessRequestRoles.ADMIN;
    await accessRequestPage.approveOrDeclineRequest(
      row,
      role,
      UserAccessRequestActions.APPROVE,
    );
    await assertSuccessfulSnackbar(page, /is now approved/i);

    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "EXTERNAL: Approve an administrator",
      variant: "default",
    });

    const newPage = await openNewBrowserContextAs(UserRole.INDUSTRY_USER);

    const dashboardPage = new DashboardPOM(newPage);
    await dashboardPage.route();
    await expect(
      newPage.getByRole("link", {
        name: AdministrationTileText.ACCESS_REQUEST,
      }),
    ).toBeVisible();
  });

  // TODO: This is a Flaky e2e test - to be fixed in ticket https://github.com/bcgov/cas-compliance/issues/496
  // test("Reject a request", async ({ page, happoScreenshot }) => {
  //   // 🛸 Navigate to Users and Access Requests from dashboard
  //   const accessRequestPage = new UsersAccessRequestPOM(page);
  //   await accessRequestPage.goToUserAccessRequestPage();
  //   await accessRequestPage.pageIsStable();
  //
  //   const row = await getRowByUniqueCellValue(
  //     page,
  //     UserAndAccessRequestGridHeaders.EMAIL.toLowerCase(),
  //     UserAndAccessRequestValues.EMAIL,
  //   );
  //
  //   const role = await accessRequestPage.getCurrentRole(row);
  //
  //   // Decline Request
  //   await accessRequestPage.approveOrDeclineRequest(
  //     row,
  //     role,
  //     UserAccessRequestActions.DECLINE,
  //   );
  //   await expect(row.getByText(role)).toBeHidden();
  //   await assertSuccessfulSnackbar(page, /is now declined/i);
  //
  //   const currentStatus = await accessRequestPage.getCurrentStatus(row);
  //   await accessRequestPage.assertActionVisibility(row, currentStatus);
  //
  //   await takeStabilizedScreenshot(happoScreenshot, page, {
  //     component: "EXTERNAL: Decline a user operator request",
  //     variant: "default",
  //   });
  //
  //   const newPage = await openNewBrowserContextAs(UserRole.INDUSTRY_USER);
  //
  //   // Verify Select an operator is visible
  //   const selectOperatorPage = new OperatorPOM(newPage);
  //   await selectOperatorPage.route(AppRoute.OPERATOR_SELECT);
  //   await selectOperatorPage.urlIsCorrect(AppRoute.OPERATOR_SELECT);
  //
  //   // 👉 Action search by legal name
  //   await selectOperatorPage.selectByLegalName(
  //     OperatorE2EValue.SEARCH_LEGAL_NAME,
  //     "Bravo Technologies - has parTNER operator - name from admin",
  //   );
  //
  //   await selectOperatorPage.msgRequestAccessDeclinedIsVisible();
  //   await linkIsVisible(
  //     selectOperatorPage.page,
  //     MessageTextOperatorSelect.SELECT_ANOTHER_OPERATOR,
  //     true,
  //   );
  //   // TODO:To be handled in ticket #457
  //   await takeStabilizedScreenshot(happoScreenshot, newPage, {
  //     component: "Decline a user operator request",
  //     variant: "default",
  //   });
  // });

  test("Edit a request", async ({ page }) => {
    // 🛸 Navigate to Users and Access Requests from dashboard
    const accessRequestPage = new UsersAccessRequestPOM(page);
    await accessRequestPage.goToUserAccessRequestPage();
    await accessRequestPage.pageIsStable();

    const row = await getRowByUniqueCellValue(
      page,
      UserAndAccessRequestGridHeaders.EMAIL.toLowerCase(),
      UserAndAccessRequestValues.EMAIL,
    );
    const role = UserAccessRequestRoles.REPORTER;
    await accessRequestPage.approveOrDeclineRequest(
      row,
      role,
      UserAccessRequestActions.APPROVE,
    );
    await assertSuccessfulSnackbar(page, /is now approved/i);

    await accessRequestPage.editRequest(row);
    await assertSuccessfulSnackbar(page, /is now pending/i);

    const currentStatus = await accessRequestPage.getCurrentStatus(row);
    await accessRequestPage.assertActionVisibility(row, currentStatus);
  });
});
