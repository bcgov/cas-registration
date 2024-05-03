/**
 * 📖 https://playwright.dev/docs/pom
 * Page objects model (POM) simplify test authoring by creating a higher-level API
 * POM simplify maintenance by capturing element selectors in one place and create reusable code to avoid repetition. *
 */
import { Locator, Page, expect } from "@playwright/test";
// 🧩  Constants
import { headersUser } from "@/e2e/utils/constants";
// ☰ Enums
import {
  AppRoute,
  ButtonText,
  DataTestID,
  TableDataField,
  UserOperatorStatus,
} from "@/e2e/utils/enums";
// ℹ️ Environment variables
import * as dotenv from "dotenv";
import {
  getRowCellBySelector,
  getTableRowByCellSelector,
  getTableRowById,
  tableColumnNamesAreCorrect,
} from "@/e2e/utils/helpers";
dotenv.config({ path: "./e2e/.env.local" });

export class UsersPOM {
  readonly page: Page;

  readonly statusColumnIndex: number = 4;

  readonly actionColumnIndex: number = 5;

  readonly url: string = process.env.E2E_BASEURL + AppRoute.USERS;

  readonly table: Locator;

  readonly tableRows: Locator;

  constructor(page: Page) {
    this.page = page;
    this.table = page.locator(DataTestID.GRID);
    this.tableRows = this.table.locator("tr");
  }

  // ###  Actions ###
  async approveOrDeclineUser(action: string) {
    // Find first row by pending status (option over using get row by rows index which is a potentially fragile structural assumption)
    const row = await getTableRowByCellSelector(
      this.table,
      `[data-field="${TableDataField.STATUS}"]:has-text("${UserOperatorStatus.PENDING}")`,
    );
    // get a handle on the actual rowId of this row
    const rowId = row.getAttribute("data-id");
    // click the row's button with action value
    await this.clickActionButtonInRow(row, action);
    // return the updated row's id
    return rowId;
  }

  async clickActionButtonInRow(row: Locator, buttonText: string) {
    await row.getByRole("button", { name: new RegExp(buttonText) }).click();
    await this.page.waitForEvent("response", { timeout: 10000 });
  }

  async route() {
    await this.page.goto(this.url);
  }

  async undoUserStatusChange(rowId: string | null) {
    // If rowId is null, throw an error indicating that rowId is required
    if (rowId === null) {
      throw new Error("rowId is required.");
    }
    const row = await getTableRowById(this.table, rowId);
    // click the row's button with action value
    await this.clickActionButtonInRow(row, ButtonText.UNDO);
  }

  // ###  Assertions ###

  async tableHasExpectedColumns(role: string) {
    await tableColumnNamesAreCorrect(this.page, headersUser[role]);
  }

  async tableIsVisible() {
    await expect(this.table).toBeVisible();
  }

  async urlIsCorrect() {
    const path = this.url;
    const currentUrl = this.page.url();
    expect(currentUrl.toLowerCase()).toMatch(path.toLowerCase());
  }

  async rowHasCorrectStatusValue(
    rowId: string | null,
    status: string = UserOperatorStatus.APPROVED || UserOperatorStatus.DECLINED,
  ) {
    // If rowId is null, throw an error indicating that rowId is required
    if (rowId === null) {
      throw new Error("rowId is required.");
    }
    const row = await getTableRowById(this.table, rowId);
    const statusCell = await getRowCellBySelector(
      row,
      `[data-field="${TableDataField.STATUS}"]:has-text("${status}")`,
    );
    const statusText = await statusCell.textContent();
    await expect(statusText).toBe(status);
  }
}
