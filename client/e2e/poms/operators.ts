/**
 * 📖 https://playwright.dev/docs/pom
 * Page objects model (POM) simplify test authoring by creating a higher-level API
 * POM simplify maintenance by capturing element selectors in one place and create reusable code to avoid repetition. *
 */
import { Locator, Page, expect } from "@playwright/test";
// ☰ Enums
import { AppRoute, UserRole } from "@/e2e/utils/enums";
// 🛠️ Helpers
import {
  checkLocatorsVisibility,
  getAllFormInputs,
  getApproveButton,
  getRejectButton,
} from "@/e2e/utils/helpers";
// ℹ️ Environment variables
import * as dotenv from "dotenv";
dotenv.config({ path: "./e2e/.env.local" });

export class OperatorsPOM {
  readonly page: Page;

  readonly url: string = process.env.E2E_BASEURL + AppRoute.OPERATORS;

  readonly internalNote =
    /Once “Approved,” the user will have access to their operator dashboard with full admin permissions, and can grant access and designate permissions to other authorized users there./i;

  readonly newOperatorNote =
    /Note: This is a new operator. You must approve this operator before approving its admin./i;

  readonly newOperatorMustBeApprovedAlert =
    /Operator must be approved before approving or declining users./i;

  readonly approvedOperatorAlert =
    /You have approved the creation of the new operator./i;

  readonly declinedOperatorAlert =
    /You have declined the creation of the new operator./i;

  readonly approvedPrimeAdminAlert =
    /You have approved the prime admin request./i;

  readonly declinedPrimeAdminAlert =
    /You have declined the prime admin request./i;

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

  async operatorsTableIsVisible() {
    await this.page.waitForSelector(".MuiDataGrid-root");
  }

  async operatorsViewIsCorrect(role: string, expectedStatuses: string[]) {
    switch (role) {
      case UserRole.INDUSTRY_USER_ADMIN:
        // later
        break;
      default:
        await expect(this.page.getByText(this.internalNote)).toBeVisible();
        break;
    }

    // Get all operators on the page
    const operators = await this.page.locator(".MuiDataGrid-row").all();

    // Get statuses of operators
    const statuses = [];
    for (const operator of operators) {
      // Get the status of the operator (6th column in the table)
      const status = await operator
        .locator(".MuiDataGrid-cell")
        .nth(5)
        .textContent();
      if (status) statuses.push(status.trim());
    }

    expect(statuses).toStrictEqual(expectedStatuses);
  }

  // 🔩 Below functions are specific to operator detail page
  async clickExpandAllButton() {
    // Click Expand All button
    await this.page.getByRole("button", { name: "Expand All" }).click();
    const allFormFields = await getAllFormInputs(this.page);
    for (const field of allFormFields) await expect(field).toBeVisible();
  }

  async clickOperatorsLink() {
    // Click Operators link on the breadcrumb and wait for the operators table to load
    await this.page.getByRole("link", { name: "Operators" }).click();
    await this.page.waitForSelector(".MuiDataGrid-root");
  }

  async checkNewOperatorNote() {
    await expect(this.page.getByText(this.newOperatorNote)).toBeVisible();
  }

  async notAllowedToApproveAdminRequest(
    modal: Locator,
    modalConfirmButton: Locator,
    modalCancelButton: Locator,
  ) {
    const approveButtons = await getApproveButton(this.page);
    const rejectButtons = await getRejectButton(this.page);
    await checkLocatorsVisibility(this.page, [
      ...(await approveButtons.all()),
      ...(await rejectButtons.all()),
    ]);
    // clicking approve admin access request
    await approveButtons.last().click();
    await expect(modal).toBeVisible();
    await checkLocatorsVisibility(this.page, [
      modalConfirmButton,
      modalCancelButton,
    ]);
    await modalConfirmButton.click();
  }

  async notAllowedToDeclineAdminRequest(
    modal: Locator,
    modalConfirmButton: Locator,
    modalCancelButton: Locator,
  ) {
    const approveButtons = await getApproveButton(this.page);
    const rejectButtons = await getRejectButton(this.page);
    await checkLocatorsVisibility(this.page, [
      ...(await approveButtons.all()),
      ...(await rejectButtons.all()),
    ]);
    // clicking reject admin access request
    await rejectButtons.last().click();
    await expect(modal).toBeVisible();
    await checkLocatorsVisibility(this.page, [
      modalConfirmButton,
      modalCancelButton,
    ]);
    await modalConfirmButton.click();
  }
}
