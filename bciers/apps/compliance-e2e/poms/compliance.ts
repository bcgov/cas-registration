/**
 * 📖 https://playwright.dev/docs/pom
 * Page objects model (POM) simplify test authoring by creating a higher-level API
 * POM simplify maintenance by capturing element selectors in one place and create reusable code to avoid repetition. *
 */
import { Locator, Page, expect } from "@playwright/test";
// ☰ Enums
import { AppRoute } from "@bciers/e2e/utils/enums";
import { Actions, ComplianceStatus } from "../utils/enums";
import { getRowCellBySelector, urlIsCorrect } from "@bciers/e2e/utils/helpers";
// ℹ️ Environment variables
import * as dotenv from "dotenv";
dotenv.config({ path: "./e2e/.env.local" });

export class CompliancePOM {
  readonly page: Page;

  readonly complianceSummariesUrl: string =
    process.env.E2E_BASEURL + AppRoute.COMPLIANCE_SUMMARIES;

  readonly reviewEarnedCreditsUrl: string =
    process.env.E2E_BASEURL + AppRoute.REVIEW_EARNED_CREDITS_REPORT;

  constructor(page: Page) {
    this.page = page;
  }

  // ###  Actions ###

  async routeToComplianceSummariesGrid() {
    await this.page.goto(this.complianceSummariesUrl);
    await urlIsCorrect(this.page, this.complianceSummariesUrl);
  }

  async searchOperationByName(operation: string, status?: string) {
    await this.page
      .getByLabel(/Operation Name/i)
      .getByPlaceholder(/Search/i)
      .fill(operation);

    if (status)
      await this.page
        .getByLabel(/Compliance Status/i)
        .getByPlaceholder(/Search/i)
        .fill(status);

    const row = this.page.getByRole("row").filter({ hasText: operation });
    // await stabilizeGrid(this.page, 1); can have multiple records per operation
    await expect(row).toBeVisible();
    return row;
  }

  async getValueByCellSelector(row: Locator, selector: string) {
    const cell = await getRowCellBySelector(row, selector);
    const value = cell.textContent();
    return value;
  }

  async openRecord(row: Locator) {
    const viewOperation = await row.getByRole("link", {
      name: /view operation/i,
    });
    await expect(viewOperation).toBeVisible();
    await viewOperation.click();
  }

  async getExpectedAction(status: string) {
    let expectedAction;
    switch (status) {
      case ComplianceStatus.EARNED_CREDITS_NOT_REQUESTED:
      case ComplianceStatus.EARNED_CREDITS_CHANGES_REQUIRED:
        expectedAction = Actions.REQUEST_ISSUANCE_OF_CREDITS;
        break;
      case ComplianceStatus.EARNED_CREDITS_APPROVED:
      case ComplianceStatus.EARNED_CREDITS_DECLINED:
      case ComplianceStatus.OBLIGATION_FULLY_MET:
      case ComplianceStatus.NO_OBLIGATION_OR_EARNED_CREDITS:
      case ComplianceStatus.EARNED_CREDITS_REQUESTED:
        expectedAction = Actions.VIEW_DETAILS;
        break;
      case ComplianceStatus.OBLIGATION_NOT_MET:
        expectedAction = Actions.MANAGE_OBLIGATION;
        break;
      case ComplianceStatus.OBLIGATION_PENDING_INVOICE:
        expectedAction = Actions.PENDING_INVOICE_CREATION;
        break;
    }
    return expectedAction;
  }

  // ###  Assertions ###

  async assertActionIsCorrect(row: Locator, status: string) {
    const currentAction = await this.getValueByCellSelector(row, "actions");
    const expectedAction = await this.getExpectedAction(status);
    await expect(currentAction).toEqual(expectedAction);
  }
}
