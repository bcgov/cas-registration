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
} from "@/administration-e2e/utils/enums";
// 🛠️ Helpers
import {
  assertSpinnerIsDone,
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

  readonly fieldUsername: Locator;

  readonly fieldPassword: Locator;

  // Form Locators

  // Link Locators

  // Message Locators

  constructor(page: Page) {
    this.page = page;
    // Initialize Button Locator
    this.fieldUsername = page.locator('xpath=//*[@id="user"]');
    this.fieldPassword = page.locator('xpath=//*[@id="password"]');
  }

  // # Actions
  async route() {
    await this.page.goto(this.url);
  }

  async goToUserAccessRequestPage() {
    await this.route();
    const linkName = AdministrationTileText.ACCESS_REQUEST;
    const link = await linkIsVisible(this.page, linkName);
    await link.click();
    await this.urlIsCorrect();
  }

  async fillUsername(username: string) {
    await this.fieldUsername.fill(username);
  }

  async getActions(status: string) {
    let actionList = [];
    const actions = Object.values(UserAccessRequestActions);
    if (status === UserAccessRequestStatus.PENDING) {
      for (let x = 0; x < actions.length - 1; x++) {
        actionList[x] = actions[x];
      }
    } else {
      actionList[0] = actions[actions.length - 1]; // Use the last element
    }

    const remainingActions = actions.filter(
      (action) => !actionList.includes(action),
    );

    return { actionList, remainingActions };
  }

  async approveRequest(row: Locator, originalRole: string) {
    const action = "Approve";
    await row.getByRole("button", { name: action }).click();
    await assertSpinnerIsDone(row);
    await this.assertCorrectRole(row, originalRole);
    await this.assertCorrectStatus(row, action);
  }

  async declineRequest(row: Locator) {
    await row.getByRole("button", { name: "Decline" }).click();
  }

  async editRequest(row: Locator) {
    let action = "Edit";
    await row.getByRole("button", { name: action }).click();
    await assertSpinnerIsDone(row);
  }

  async assignNewRole(row: Locator, newRole: string) {
    const action = "Approve";
    const dropdown = await row.getByRole("combobox");
    await expect(dropdown).toBeVisible();
    await dropdown.click();
    // Wait for options container to appear
    await selectOptionFromCombobox(this.page, newRole);

    await row.getByRole("button", { name: action }).click();
    await assertSpinnerIsDone(row);
    await this.assertCorrectRole(row, newRole);
    await this.assertCorrectStatus(row, action);
  }

  // # Assertions
  async urlIsCorrect() {
    const path = this.userAccessRequestURL.toLowerCase();
    const currentUrl = this.page.url().toLowerCase();
    expect(currentUrl).toMatch(path);
  }

  async assertActionVisibility(row: Locator, status: string) {
    const actions = (await this.getActions(status)).actionList;
    const hiddenActions = (await this.getActions(status)).remainingActions;
    for (let x = 0; x < actions.length; x++) {
      await expect(row.getByRole("button", { name: actions[x] })).toBeVisible();
    }

    for (let x = 0; x < hiddenActions.length; x++) {
      await expect(
        row.getByRole("button", { name: hiddenActions[x] }),
      ).toBeHidden();
    }
  }

  async assertCorrectRole(row: Locator, originalRole: string) {
    const userRoleCell = row.locator('[data-field="userRole"] span');
    const userRole = await userRoleCell.innerText();
    expect(userRole).toMatch(originalRole);
  }

  async assertCorrectStatus(row: Locator, action: string) {
    const statusCell = row.locator('[data-field="status"]');
    const statusText = await statusCell.textContent();

    if (action === UserAccessRequestActions.APPROVE) {
      expect(statusText).toMatch(UserAccessRequestStatus.APPROVED);
    } else if (action === UserAccessRequestActions.DECLINE) {
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
