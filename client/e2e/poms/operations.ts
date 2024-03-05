/**
 * 📖 https://playwright.dev/docs/pom
 * Page objects model (POM) simplify test authoring by creating a higher-level API
 * POM simplify maintenance by capturing element selectors in one place and create reusable code to avoid repetition. *
 */
import { Locator, Page, expect } from "@playwright/test";
// ☰ Enums
import { AppRoute, UserRole } from "@/e2e/utils/enums";
// ℹ️ Environment variables
import * as dotenv from "dotenv";
dotenv.config({ path: "./e2e/.env.local" });

export class OperationsPOM {
  readonly page: Page;

  readonly url: string = process.env.E2E_BASEURL + AppRoute.OPERATIONS;

  readonly internalNote =
    /Once “Approved,” a B.C. OBPS Regulated Operation ID will be issued for the operation/i;

  readonly buttonAdd: Locator;

  readonly buttonSaveAndContinue: Locator;

  readonly buttonSubmit: Locator;

  constructor(page: Page) {
    this.page = page;
    this.buttonAdd = page.getByRole("button", {
      name: /add operation/i,
    });
    this.buttonSaveAndContinue = page.getByRole("button", {
      name: /save and continue/i,
    });
    this.buttonSubmit = page.getByRole("button", {
      name: /submit/i,
    });
  }

  async route() {
    await this.page.goto(this.url);
  }

  async urlIsCorrect() {
    const path = this.url;
    const currentUrl = this.page.url();
    expect(currentUrl.toLowerCase()).toMatch(path.toLowerCase());
  }

  async columnNamesAreCorrect(expectedColumnNames: string[]) {
    const columnNames = await this.page.$$eval(
      ".MuiDataGrid-columnHeaderTitle",
      (columns) =>
        columns.map((column) => {
          return column?.textContent?.trim();
        }),
    );
    for (let i = 0; i < expectedColumnNames.length; i++) {
      expect(columnNames[i]).toEqual(expectedColumnNames[i]);
    }
  }

  async operationsViewIsCorrect(role: string, expectedStatuses: string[]) {
    switch (role) {
      case UserRole.INDUSTRY_USER_ADMIN:
      case UserRole.INDUSTRY_USER:
        // later
        break;
      default:
        await expect(this.page.getByText(this.internalNote)).toBeVisible();
        await expect(this.buttonAdd).not.toBeVisible();
        break;
    }

    // Get all operations on the page
    const operations = await this.page.$$(".MuiDataGrid-row");

    // Get statuses of operations
    const statuses = [];
    for (const operation of operations) {
      // Get the status of the operation (5th column in the table)
      const status = await operation
        .$$(".MuiDataGrid-cell")
        .then((cells) => cells[5].textContent());
      if (status) statuses.push(status.trim());
    }

    expect(statuses).toStrictEqual(expectedStatuses);
  }
}
