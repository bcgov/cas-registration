import { expect } from "@playwright/test";
import { setupBeforeAllTest } from "@bciers/e2e/setupBeforeAll";
import { UserRole } from "@bciers/e2e/utils/enums";
import {
  stabilizeGrid,
  assertSuccessfulSnackbar,
  tableColumnNamesAreCorrect,
  getRowByUniqueCellValue,
} from "@bciers/e2e/utils/helpers";
import {
  UserAndAccessRequestGridHeaders,
  UserAndAccessRequestValues,
} from "@/administration-e2e/utils/enums";
import { UsersAccessRequestPOM } from "@/administration-e2e/poms/users-access-request";
import { AdministrationTileText } from "@/dashboard-e2e/utils/enums";

const test = setupBeforeAllTest(UserRole.INDUSTRY_USER_ADMIN);

// 🏷 Annotate test suite as serial so to use 1 worker- prevents failure in setupTestEnvironment
test.describe.configure({ mode: "serial" });
test.describe("Approve External User", () => {
  test("Approve a reporter", async ({ page }) => {
    // 🛸 Navigate to Users and Access Requests from dashboard
    const accessRequestPage = new UsersAccessRequestPOM(page);
    await accessRequestPage.route();
    await accessRequestPage.goToUserAccessRequestPage();
    await expect(
      page.getByRole("heading", {
        name: AdministrationTileText.ACCESS_REQUEST,
      }),
    ).toBeVisible();
    await stabilizeGrid(page, 6);

    // Verify table headers are correct
    await tableColumnNamesAreCorrect(
      page,
      Object.values(UserAndAccessRequestGridHeaders),
    );

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

    // Log in as bc-cas-dev-secondary
    await accessRequestPage.logInAs(UserRole.INDUSTRY_USER);
    await expect(
      page.getByRole("link", { name: AdministrationTileText.ACCESS_REQUEST }),
    ).toBeHidden();
  });

  test("Approve an administrator", async ({ page }) => {
    // 🛸 Navigate to Users and Access Requests from dashboard
    const accessRequestPage = new UsersAccessRequestPOM(page);
    await accessRequestPage.route();
    await accessRequestPage.goToUserAccessRequestPage();
    await expect(
      page.getByRole("heading", {
        name: AdministrationTileText.ACCESS_REQUEST,
      }),
    ).toBeVisible();
    await stabilizeGrid(page, 6);

    // Verify table headers are correct
    await tableColumnNamesAreCorrect(
      page,
      Object.values(UserAndAccessRequestGridHeaders),
    );

    const row = await getRowByUniqueCellValue(
      page,
      UserAndAccessRequestGridHeaders.EMAIL.toLowerCase(),
      UserAndAccessRequestValues.EMAIL,
    );
    await expect(row).toBeVisible();

    await accessRequestPage.editRequest(row);
    await accessRequestPage.assignNewRole(row, "Admin");
    await assertSuccessfulSnackbar(page, /is now approved/i);

    // Log in as bc-cas-dev-secondary
    await accessRequestPage.logInAs(UserRole.INDUSTRY_USER);
    await expect(
      page.getByRole("link", { name: AdministrationTileText.ACCESS_REQUEST }),
    ).toBeVisible();
  });
});
