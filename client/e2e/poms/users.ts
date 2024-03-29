/**
 * 📖 https://playwright.dev/docs/pom
 * Page objects model (POM) simplify test authoring by creating a higher-level API
 * POM simplify maintenance by capturing element selectors in one place and create reusable code to avoid repetition. *
 */
import { Page, expect } from "@playwright/test";
// ☰ Enums
import { AppRoute, UserOperatorStatus } from "@/e2e/utils/enums";
// ℹ️ Environment variables
import * as dotenv from "dotenv";
dotenv.config({ path: "./e2e/.env.local" });

export class UsersPOM {
  readonly page: Page;

  readonly statusColumnIndex: number = 4;

  readonly actionColumnIndex: number = 5;

  readonly url: string = process.env.E2E_BASEURL + AppRoute.USERS;

  constructor(page: Page) {
    this.page = page;
  }

  async route() {
    await this.page.goto(this.url);
  }

  async urlIsCorrect() {
    const path = this.url;
    const currentUrl = this.page.url();
    expect(currentUrl.toLowerCase()).toMatch(path.toLowerCase());
  }

  async userStatusIsUpdated(expectedStatus: string, rowIndex: number = 0) {
    // Get all users from the table
    const userRows = await this.page.$$(".MuiDataGrid-row");
    const user = userRows[rowIndex];

    const status = await user
      .$$(".MuiDataGrid-cell")
      .then((cells) => cells[this.statusColumnIndex].textContent());

    expect(status).toStrictEqual(expectedStatus);
  }

  async approveOrDeclineUser(
    action: UserOperatorStatus.APPROVED | UserOperatorStatus.DECLINED,
    rowIndex: number = 0,
  ) {
    const userRows = await this.page.$$(".MuiDataGrid-row");
    const user = userRows[rowIndex];
    const status = await user
      .$$(".MuiDataGrid-cell")
      .then((cells) => cells[this.statusColumnIndex].textContent());

    expect(status).toStrictEqual(UserOperatorStatus.PENDING);
    const buttonText =
      action === UserOperatorStatus.APPROVED ? "Approve" : "Decline";
    const actionButton = await user
      .$$(".MuiDataGrid-cell")
      .then((cells) =>
        cells[this.actionColumnIndex].$(`button:has-text('${buttonText}')`),
      );

    await actionButton?.click();

    await this.page.waitForEvent("response", {
      timeout: 10000,
    });

    // Verify that the user status is updated
    await this.userStatusIsUpdated(action, rowIndex);
  }

  async undoUserStatusChange(
    statusToUndo: string = UserOperatorStatus.APPROVED ||
      UserOperatorStatus.DECLINED,
    rowIndex: number = 0,
  ) {
    const userRows = await this.page.$$(".MuiDataGrid-row");
    const user = userRows[rowIndex];
    const status = await user
      .$$(".MuiDataGrid-cell")
      .then((cells) => cells[this.statusColumnIndex].textContent());

    expect(status).toStrictEqual(statusToUndo);
    const undoButton = await user
      .$$(".MuiDataGrid-cell")
      .then((cells) =>
        cells[this.actionColumnIndex].$("button:has-text('Undo')"),
      );

    await undoButton?.click();

    await this.page.waitForEvent("response", {
      timeout: 10000,
    });

    // Verify that the user status is updated to "Pending"
    await this.userStatusIsUpdated(UserOperatorStatus.PENDING, rowIndex);
  }
}
