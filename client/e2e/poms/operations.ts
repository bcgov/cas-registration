/**
 * 📖 https://playwright.dev/docs/pom
 * Page objects model (POM) simplify test authoring by creating a higher-level API
 * POM simplify maintenance by capturing element selectors in one place and create reusable code to avoid repetition. *
 */
import { Locator, Page, expect } from "@playwright/test";
// ☰ Enums
import { AppRoute, UserRole } from "@/e2e/utils/enums";
// 🛠️ Helpers
import { getAllFormInputs } from "@/e2e/utils/helpers";
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

  readonly buttonAddOperation: Locator;

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
    this.buttonAddOperation = page.getByRole("button", {
      name: /add operation/i,
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

  async operationsTableIsVisible() {
    await this.page.waitForSelector(".MuiDataGrid-root");
  }

  async operationsViewIsCorrect(role: string, expectedStatuses: string[]) {
    let statusIndex = 5;
    switch (role) {
      case UserRole.INDUSTRY_USER_ADMIN:
      case UserRole.INDUSTRY_USER:
        // The status column is different for industry users
        statusIndex = 4;
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
        .then((cells) => cells[statusIndex].textContent());
      if (status) statuses.push(status.trim());
    }

    expect(statuses).toStrictEqual(expectedStatuses);
  }

  // 🔩 Below functions are specific to operation detail page
  async clickExpandAllButton() {
    // Click Expand All button
    await this.page.getByRole("button", { name: "Expand All" }).click();
    const allFormFields = await getAllFormInputs(this.page);
    for (const field of allFormFields) {
      // Last input is the file widget input, which is not visible
      if (field === allFormFields[allFormFields.length - 1]) {
        await expect(field).not.toBeVisible();
      } else await expect(field).toBeVisible();
    }
  }

  async clickCollapseAllButton() {
    // Click Collapse All button
    await this.page.getByRole("button", { name: "Collapse All" }).click();
    const allFormFields = await getAllFormInputs(this.page);
    for (const field of allFormFields) await expect(field).not.toBeVisible();
  }

  async clickAddOperationButton() {
    // Click Add Operation button
    await this.buttonAddOperation.click();
  }

  async clickOperationsLink() {
    // Click Operations link on the breadcrumb and wait for the operations table to load
    await this.page.getByRole("link", { name: "Operations" }).click();
    await this.page.waitForSelector(".MuiDataGrid-root");
  }

  async clickStartRegistrationLink() {
    // Click Start Registration link
    await this.page.getByRole("link", { name: "Start Registration" }).click();
  }

  async getRequestChangesButton() {
    const requestChangesButton = this.page.locator(
      "button[aria-label='Request Changes']",
    );
    return requestChangesButton;
  }

  async getConfirmChangeRequestButton() {
    return this.page.locator("button[aria-label='Confirm Change Request']");
  }

  async getCancelChangeRequestButton() {
    return this.page.locator("button[aria-label='Cancel Change Request']");
  }

  async getUndoChangeRequestButton() {
    return this.page.locator("button[aria-label='Undo Request Changes']");
  }
}
