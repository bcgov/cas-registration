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
  UserAndAccessRequestGridHeaders,
  UserAndAccessRequestValues,
} from "@/administration-e2e/utils/enums";
import { UsersAccessRequestPOM } from "@/administration-e2e/poms/users-access-request";
import { DashboardPOM } from "@/dashboard-e2e/poms/dashboard";
import { AdministrationTileText } from "@/dashboard-e2e/utils/enums";
import { upsertUserOperatorRecord } from "@bciers/e2e/utils/queries";
import { SecondaryUserOperatorFixtureFields } from "@/administration-e2e/utils/enums";
import { OperatorPOM } from "@/administration-e2e/poms/operator";
const happoPlaywright = require("happo-playwright");

const test = setupBeforeAllTest(UserRole.INDUSTRY_USER_ADMIN);
test.beforeAll(async () => {
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
test.describe("Approve External User", () => {
  test("Approve a reporter", async ({ page }) => {
    // 🛸 Navigate to Users and Access Requests from dashboard
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

    const userRoleCell = row.getByRole("combobox");
    const originalRole = await userRoleCell.innerText();
    await accessRequestPage.approveRequest(row, originalRole);
    await assertSuccessfulSnackbar(page, /is now approved/i);

    await takeStabilizedScreenshot(happoPlaywright, page, {
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

  test("Approve an administrator", async ({ page }) => {
    // 🛸 Navigate to Users and Access Requests from dashboard
    const accessRequestPage = new UsersAccessRequestPOM(page);
    await accessRequestPage.goToUserAccessRequestPage();
    await accessRequestPage.pageIsStable();

    const row = await getRowByUniqueCellValue(
      page,
      UserAndAccessRequestGridHeaders.EMAIL.toLowerCase(),
      UserAndAccessRequestValues.EMAIL,
    );

    await accessRequestPage.editRequest(row);
    await accessRequestPage.assignNewRole(row, "Admin");
    await assertSuccessfulSnackbar(page, /is now approved/i);

    await takeStabilizedScreenshot(happoPlaywright, page, {
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

  test("Reject a request", async ({ page }) => {
    // 🛸 Navigate to Users and Access Requests from dashboard
    const accessRequestPage = new UsersAccessRequestPOM(page);
    await accessRequestPage.goToUserAccessRequestPage();
    await accessRequestPage.pageIsStable();

    const row = await getRowByUniqueCellValue(
      page,
      UserAndAccessRequestGridHeaders.EMAIL.toLowerCase(),
      UserAndAccessRequestValues.EMAIL,
    );

    await accessRequestPage.editRequest(row);
    await accessRequestPage.declineRequest(row);
    await assertSuccessfulSnackbar(page, /is now declined/i);

    await takeStabilizedScreenshot(happoPlaywright, page, {
      component: "EXTERNAL: Decline a user operator request",
      variant: "default",
    });

    const newPage = await openNewBrowserContextAs(UserRole.INDUSTRY_USER);
    const dashboardPage = new DashboardPOM(newPage);
    await dashboardPage.route();

    // Verify Select an operator is visible
    const selectOperatorPage = new OperatorPOM(newPage);
    await selectOperatorPage.route(AppRoute.OPERATOR_SELECT);
    await selectOperatorPage.urlIsCorrect(AppRoute.OPERATOR_SELECT);

    // 👉 Action search by legal name
    await selectOperatorPage.selectByLegalName(
      OperatorE2EValue.SEARCH_LEGAL_NAME,
      "Bravo Technologies - has parTNER operator",
    );

    await selectOperatorPage.msgRequestAccessDeclinedIsVisible();
    await linkIsVisible(
      selectOperatorPage.page,
      MessageTextOperatorSelect.SELECT_ANOTHER_OPERATOR,
      true,
    );

    await takeStabilizedScreenshot(happoPlaywright, selectOperatorPage.page, {
      component: "User is rejected access to operator",
      variant: "default",
    });
  });
});
