/**
 * 📖 https://playwright.dev/docs/pom
 * Page objects model (POM) simplify test authoring by creating a higher-level API
 * POM simplify maintenance by capturing element selectors in one place and create reusable code to avoid repetition. *
 */
import { Locator, Page, expect } from "@playwright/test";
// ☰ Enums
import {
  AppRoute,
  UserAccessRequestStatus,
  UserAccessRequestActions,
  UserAndAccessRequestGridHeaders,
  UserAccessRequestRoles,
  UnactionedRequest,
  ActionedRequest,
} from "@/administration-e2e/utils/enums";
// 🛠️ Helpers
import {
  waitForSpinner,
  linkIsVisible,
  selectOptionFromCombobox,
  stabilizeGrid,
  tableColumnNamesAreCorrect,
} from "@bciers/e2e/utils/helpers";
import { AdministrationTileText } from "@/dashboard-e2e/utils/enums";

export class UsersAccessRequestPOM {
  readonly page: Page;

  readonly url: string = process.env.E2E_BASEURL;

  readonly userAccessRequestURL = this.url + AppRoute.USER_ACCESS_REQUEST;

  // Button Locators

  // Field Locators

  // Form Locators

  // Link Locators

  // Message Locators

  constructor(page: Page) {
    this.page = page;
  }

  // # Actions
  async route() {
    await this.page.goto(this.url);
  }

  async goToUserAccessRequestPage() {
    await this.route();
    const linkName = AdministrationTileText.ACCESS_REQUEST;
    const link = await linkIsVisible(this.page, linkName, true);
    await link.click();
    await this.urlIsCorrect();
  }

  async getActions(status: string) {
    const expectedActions =
      status === UserAccessRequestStatus.PENDING
        ? Object.values(UnactionedRequest)
        : Object.values(ActionedRequest);

    const hiddenActions =
      status === UserAccessRequestStatus.PENDING
        ? Object.values(ActionedRequest)
        : Object.values(UnactionedRequest);

    return { expectedActions, hiddenActions };
  }

  async approveOrDeclineRequest(row: Locator, role: string, action: string) {
    if (action === UserAccessRequestActions.APPROVE) {
      await selectOptionFromCombobox(this.page, role);
      await row.getByRole("button", { name: action }).click();
      await waitForSpinner(row);
      await this.assertCorrectRole(row, role);
      await this.assertCorrectStatus(row, action);
    } else if (action === UserAccessRequestActions.DECLINE) {
      await row.getByRole("button", { name: action }).click();
      await waitForSpinner(row);
      await this.assertCorrectStatus(row, action);
    }
  }

  async editRequest(row: Locator) {
    const action = UserAccessRequestActions.EDIT;
    await row.getByRole("button", { name: action }).click();
    await waitForSpinner(row);
  }

  async getCurrentStatus(row: Locator) {
    const statusCell = row.locator('[data-field="status"]');
    const statusText = await statusCell.textContent();
    console.log("getcurrentstatus: ", statusText);
    return statusText;
  }

  async getCurrentRole(row: Locator) {
    const roleCell = row.locator('[data-field="userRole"]');
    const roleText = await roleCell.innerText();
    return roleText;
  }

  // # Assertions
  async urlIsCorrect() {
    const path = this.userAccessRequestURL.toLowerCase();
    const currentUrl = this.page.url().toLowerCase();
    expect(currentUrl).toMatch(path);
  }

  async assertActionVisibility(row: Locator, status: string) {
    const expectedActions = (await this.getActions(status)).expectedActions;
    const hiddenActions = (await this.getActions(status)).hiddenActions;
    for (let x = 0; x < expectedActions.length; x++) {
      await expect(
        row.getByRole("button", { name: expectedActions[x] }),
      ).toBeVisible();
    }

    for (let x = 0; x < hiddenActions.length; x++) {
      await expect(
        row.getByRole("button", { name: hiddenActions[x] }),
      ).toBeHidden();
    }
  }

  async assertCorrectRole(row: Locator, role: string) {
    const currentRole = await this.getCurrentRole(row);
    await expect(role).toMatch(currentRole);
  }

  async assertCorrectStatus(row: Locator, role: string) {
    const statusText = await this.getCurrentStatus(row);

    if (
      role === UserAccessRequestRoles.ADMIN ||
      role === UserAccessRequestRoles.REPORTER
    ) {
      expect(statusText).toMatch(UserAccessRequestStatus.APPROVED);
    } else if (role === UserAccessRequestRoles.NONE) {
      expect(statusText).toMatch(UserAccessRequestStatus.DECLINED);
    }
  }

  async pageIsStable() {
    await expect(
      this.page.getByRole("heading", {
        name: AdministrationTileText.ACCESS_REQUEST,
      }),
    ).toBeVisible();
    await stabilizeGrid(this.page, 6);
    await tableColumnNamesAreCorrect(
      this.page,
      Object.values(UserAndAccessRequestGridHeaders),
    );
  }
}
