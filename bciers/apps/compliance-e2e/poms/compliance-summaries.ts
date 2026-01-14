import { Locator, Page, expect } from "@playwright/test";
import {
  AppRoutes,
  ComplianceSummariesGridHeaders,
} from "@/compliance-e2e/utils/enums";
import { GRID_ROOT } from "@/compliance-e2e/utils/constants";

export class ComplianceSummariesPOM {
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
    return this.page.locator(GRID_ROOT);
  }

  /**
   * Find the row whose text contains the given operation name.
   */

  async getRowByOperationName(operationName: string): Promise<Locator> {
    // wait for the grid to have rendered rows at all
    await expect(this.grid.getByRole("row").first()).toHaveCount(1);

    const row = this.grid
      .getByRole("row")
      .filter({ hasText: operationName })
      .first();

    // wait for it to exist before asserting visibility
    await expect(row).toHaveCount(1);
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
      ComplianceSummariesGridHeaders.DISPLAY_STATUS,
    );

    expect(status).toBe(expectedStatus);
  }

  /**
   * Click an action link in the compliance summaries grid for a given operation
   * and optionally assert the resulting URL.
   */
  async openActionForOperation(options: {
    operationName: string;
    linkName: string | RegExp;
    urlPattern?: string | RegExp;
  }) {
    const { operationName, linkName, urlPattern } = options;

    // Find the row for this operation
    const row = await this.getRowByOperationName(operationName);

    // Find the action link within that row
    const actionLink = row.getByRole("link", { name: linkName });
    await expect(actionLink).toBeVisible();

    // Get the href from the link
    const href = await actionLink.getAttribute("href");

    // Build absolute URL
    const targetUrl = new URL(href, this.url).toString();

    // Navigate to url route
    await this.page.goto(targetUrl, { waitUntil: "domcontentloaded" });

    // Optionally assert URL
    if (urlPattern) {
      await expect(this.page).toHaveURL(urlPattern);
    }
  }
}
