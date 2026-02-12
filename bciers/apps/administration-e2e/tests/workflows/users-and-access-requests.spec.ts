import { expect } from "@playwright/test";
import { setupBeforeAllTest } from "@bciers/e2e/setupBeforeAll";
import { UserRole } from "@bciers/e2e/utils/enums";
import {
  assertSuccessfulSnackbar,
  getRowByUniqueCellValue,
  linkIsVisible,
  takeStabilizedScreenshot,
  getStorageStateForRole, // ✅ import this (wherever it currently lives)
} from "@bciers/e2e/utils/helpers";
import {
  AppRoute,
  MessageTextOperatorSelect,
  OperatorE2EValue,
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
import { OperatorPOM } from "@/administration-e2e/poms/operator";

const test = setupBeforeAllTest(UserRole.INDUSTRY_USER_ADMIN);

test.beforeEach(async () => {
  await upsertUserOperatorRecord(
    SecondaryUserOperatorFixtureFields.USER,
    SecondaryUserOperatorFixtureFields.ROLE_PENDING,
    SecondaryUserOperatorFixtureFields.STATUS_PENDING,
  );
});

test.describe
  .serial("User Access Request Workflow (Industry Admin → Industry User)", () => {
  // -------------------------
  // ADMIN CONTEXT (fixture)
  // -------------------------
  test.use({
    storageState: getStorageStateForRole(UserRole.INDUSTRY_USER_ADMIN),
  });

  test("Approve a reporter (Industry User - Admin)", async ({
    page,
    happoScreenshot,
  }) => {
    const accessRequestPage = new UsersAccessRequestPOM(page);
    await accessRequestPage.goToUserAccessRequestPage();
    await accessRequestPage.pageIsStable();

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
  });

  // -------------------------
  // INDUSTRY CONTEXT (fixture)
  // -------------------------
  test.use({ storageState: getStorageStateForRole(UserRole.INDUSTRY_USER) });

  test("Approve a reporter (Industry User)", async ({ page }) => {
    const dashboardPage = new DashboardPOM(page);
    await dashboardPage.route();

    await expect(
      page.getByRole("link", { name: AdministrationTileText.ACCESS_REQUEST }),
    ).toBeHidden();
  });

  // -------------------------
  // back to ADMIN
  // -------------------------
  test.use({
    storageState: getStorageStateForRole(UserRole.INDUSTRY_USER_ADMIN),
  });

  test("Reject a request (Industry User - Admin)", async ({
    page,
    happoScreenshot,
  }) => {
    const accessRequestPage = new UsersAccessRequestPOM(page);
    await accessRequestPage.goToUserAccessRequestPage();
    await accessRequestPage.pageIsStable();

    const row = await getRowByUniqueCellValue(
      page,
      UserAndAccessRequestGridHeaders.EMAIL.toLowerCase(),
      UserAndAccessRequestValues.EMAIL,
    );

    const role = await accessRequestPage.getCurrentRole(row);

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
  });

  // -------------------------
  // and INDUSTRY verify
  // -------------------------
  test.use({ storageState: getStorageStateForRole(UserRole.INDUSTRY_USER) });

  test("Reject a request (Industry User)", async ({
    page,
    happoScreenshot,
  }) => {
    const selectOperatorPage = new OperatorPOM(page);
    await selectOperatorPage.route(AppRoute.OPERATOR_SELECT);
    await selectOperatorPage.urlIsCorrect(AppRoute.OPERATOR_SELECT);

    await selectOperatorPage.selectByLegalName(
      OperatorE2EValue.SEARCH_LEGAL_NAME,
      "Bravo Technologies - has parTNER operator - name from admin",
    );

    await expect(selectOperatorPage.page).toHaveURL(
      /select-operator\/confirm/,
      {
        timeout: 30_000,
      },
    );

    await selectOperatorPage.msgRequestAccessDeclinedIsVisible();
    await linkIsVisible(
      selectOperatorPage.page,
      MessageTextOperatorSelect.SELECT_ANOTHER_OPERATOR,
      true,
    );

    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "Decline a user operator request",
      variant: "default",
    });
  });
});
