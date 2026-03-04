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
test.describe.configure({ mode: "serial" });

type LastAction =
  | "approve_reporter"
  | "approve_admin"
  | "decline_request"
  | "edit_request"
  | null;

let lastAction: LastAction = null;

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

test.describe("Users & Access Requests: admin action then external verification", () => {
  // -----------------------
  // 1) Approve reporter (admin)
  // -----------------------
  test("Admin: Approve a reporter", async ({ page, happoScreenshot }) => {
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

    lastAction = "approve_reporter";
  });

  test("External user: sees reporter approval effect", async () => {
    expect(lastAction).toBe("approve_reporter");

    const newPage = await openNewBrowserContextAs(UserRole.INDUSTRY_USER);

    const dashboardPage = new DashboardPOM(newPage);
    await dashboardPage.route();

    await expect(
      newPage.getByRole("link", {
        name: AdministrationTileText.ACCESS_REQUEST,
      }),
    ).toBeHidden();

    lastAction = null;
  });

  // -----------------------
  // 2) Approve administrator (admin)
  // -----------------------
  test("Admin: Approve an administrator", async ({ page, happoScreenshot }) => {
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

    lastAction = "approve_admin";
  });

  test("External user: sees admin approval effect", async () => {
    expect(lastAction).toBe("approve_admin");

    const newPage = await openNewBrowserContextAs(UserRole.INDUSTRY_USER);

    const dashboardPage = new DashboardPOM(newPage);
    await dashboardPage.route();

    await expect(
      newPage.getByRole("link", {
        name: AdministrationTileText.ACCESS_REQUEST,
      }),
    ).toBeVisible();

    lastAction = null;
  });

  // -----------------------
  // 3) Decline request (admin)
  // -----------------------
  test("Admin: Reject a request", async ({ page, happoScreenshot }) => {
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

    lastAction = "decline_request";
  });

  test("External user: sees declined-request effect", async () => {
    expect(lastAction).toBe("decline_request");

    const newPage = await openNewBrowserContextAs(UserRole.INDUSTRY_USER);

    const selectOperatorPage = new OperatorPOM(newPage);
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

    await takeStabilizedScreenshot(happoScreenshot, newPage, {
      component: "Decline a user operator request",
      variant: "default",
    });

    lastAction = null;
  });

  // -----------------------
  // 4) Edit request (admin)
  // -----------------------
  test("Admin: Edit a request", async ({ page }) => {
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
