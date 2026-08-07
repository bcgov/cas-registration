import {
  assertFieldVisibility,
  clickButton,
  waitForGridReady,
} from "@bciers/e2e/utils/helpers";
import { Page, expect } from "@playwright/test";
import { clickViewReportDetails } from "../utils/helpers";
import { AppRoutes } from "../utils/enums";

export class ReportHistoryPOM {
  readonly page: Page;
  readonly urlRegex: RegExp;
  readonly url: string =
    process.env.E2E_BASEURL + AppRoutes.GRID_REPORT_HISTORY;

  constructor(page: Page) {
    this.page = page;

    this.urlRegex = new RegExp(`${this.url}/\\d+`);
  }

  async route(report_id: string | number): Promise<void> {
    await this.page.goto(`${this.url}/${report_id}`);
    await waitForGridReady(this.page, { timeout: 30_000 });
  }

  async validatePageElements(operationName: string): Promise<void> {
    await assertFieldVisibility(
      this.page,
      [
        operationName,
        "Report version",
        "Date of submission",
        "Submitted by",
        "Actions",
      ],
      true,
    );
  }

  /**
   * Asserts the "Report version" column contains exactly the expected rows, in order.
   *
   * The grid lists versions newest first: the newest renders as "Current Version" and
   * older ones as "Version N", counting up from the oldest — so a report with two
   * versions reads ["Current Version", "Version 1"], and "Version 2" never appears.
   */
  async verifyVersions(expectedVersions: string[]): Promise<void> {
    await waitForGridReady(this.page);

    const versionCells = this.page.locator(
      '[role="gridcell"][data-field="version"]',
    );
    await expect(versionCells).toHaveText(expectedVersions);
  }

  /**
   * Clicks the "View Details" button for a specific report version in the report history page, based on the version number.
   * If no version number is provided, clicks the "View Details" button for the current version of the report.
   */
  async viewDetailsFromReportHistory(version?: string | number): Promise<void> {
    await waitForGridReady(this.page);
    const versionName = version ? `Version ${version}` : "Current Version";
    const row = this.page
      .getByRole("row")
      .filter({ hasText: versionName })
      .first();
    await expect(row).toBeVisible();
    await clickViewReportDetails(this.page, row);
  }

  /**
   * Clicks the "Continue" button for the current draft version .
   */
  async continueReportFromHistory(version: string | number): Promise<void> {
    await waitForGridReady(this.page);
    const reviewOpInfoUrl = new RegExp(
      `${process.env.E2E_BASEURL}reporting/reports/${version}/review-operation-information`,
    );
    await clickButton(this.page, "Continue", {
      waitForUrl: reviewOpInfoUrl,
    });
  }
}
