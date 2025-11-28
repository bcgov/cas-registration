import { Locator, Page, expect } from "@playwright/test";
import {
  AppRoutes,
  ComplianceSummariesGridHeaders,
} from "@/compliance-e2e/utils/enums";

export class GridComplianceSummariesPOM {
  readonly page: Page;

  readonly url: string =
    process.env.E2E_BASEURL + AppRoutes.GRID_COMPLIANCE_SUMMARIES;

  constructor(page: Page) {
    this.page = page;
  }

  // ### Actions ###

  async route() {
    await this.page.goto(this.url);
  }

  private get grid(): Locator {
    return this.page.locator(".MuiDataGrid-root");
  }

  /**
   * Find the row whose text contains the given operation name.
   */
  async getRowByOperationName(operationName: string): Promise<Locator> {
    const row = this.grid
      .getByRole("row")
      .filter({ hasText: operationName })
      .first();

    await expect(row).toBeVisible();
    return row;
  }

  /**
   * Returns the cell text for a given operation + data-field.
   */
  async getCellTextForOperation(
    operationName: string,
    field: ComplianceSummariesGridHeaders,
  ): Promise<string> {
    const row = await this.getRowByOperationName(operationName);

    const cell = row.locator(`[role="gridcell"][data-field="${field}"]`);

    const text = (await cell.textContent())?.trim() || "";
    return text;
  }

  /**
   * Returns the Status text for a given operation.
   */
  async assertStatusForOperation(
    operationName: string,
    expectedStatus: string,
  ): Promise<void> {
    const status = await this.getCellTextForOperation(
      operationName,
      ComplianceSummariesGridHeaders.STATUS,
    );

    expect(status).toBe(expectedStatus);
  }

  /**
   * Click an action link in the compliance summaries grid for a given operation
   * and optionally assert the resulting URL and a UI element on the target page.
   *
   * @param operationName - The operation name text used to locate the row.
   * @param linkName - The visible text of the link in the actions cell
   *                   (string or RegExp).
   * @param urlPattern - Optional RegExp to assert navigation URL.
   *                     If omitted, no URL assertion is performed.
   * @param postNavButtonName - Optional button text (string or RegExp) to assert
   *                            that the expected page has loaded.
   */
  async openActionForOperation(options: {
    operationName: string;
    linkName: string | RegExp;
    urlPattern?: RegExp;
    postNavButtonName?: string | RegExp;
  }) {
    const { operationName, linkName, urlPattern, postNavButtonName } = options;

    // Find the row for this operation
    const row = await this.getRowByOperationName(operationName);

    // Find the action link within that row
    const actionLink = row.getByRole("link", {
      name: linkName,
    });

    await expect(actionLink).toBeVisible();

    // Click and optionally wait for URL
    if (urlPattern) {
      await Promise.all([this.page.waitForURL(urlPattern), actionLink.click()]);
    } else {
      await actionLink.click();
    }

    // Optionally assert some element on the destination page (e.g., a button)
    if (postNavButtonName) {
      await expect(
        this.page.getByRole("button", { name: postNavButtonName }),
      ).toBeVisible();
    }
  }
}
