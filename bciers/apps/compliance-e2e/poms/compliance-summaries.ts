import { Locator, Page, expect } from "@playwright/test";
import {
  AppRoutes,
  ComplianceSummariesGridHeaders,
} from "@/compliance-e2e/utils/enums";

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
      ComplianceSummariesGridHeaders.DISPLAY_STATUS,
    );

    expect(status).toBe(expectedStatus);
  }

  /**
   * Click an action link in the compliance summaries grid for a given operation
   * and optionally assert the resulting URL and a UI element on the target page.
   */
  async openActionForOperation(options: {
    operationName: string;
    linkName: string | RegExp;
    urlPattern?: string | RegExp;
  }) {
    const { operationName, linkName } = options;

    const row = await this.getRowByOperationName(operationName);

    const actionLink = row.getByRole("link", { name: linkName });
    await expect(actionLink).toBeVisible();

    const href = await actionLink.getAttribute("href");

    if (!href) {
      throw new Error("Manage Obligation action link has no href");
    }

    const targetUrl =
      (process.env.E2E_BASEURL ?? "http://localhost:3000") + href;

    await this.page.goto(targetUrl, { waitUntil: "load" });
  }
}
