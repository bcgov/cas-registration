import { Page, expect } from "@playwright/test";
import { AppRoutes } from "@/reporting-e2e/utils/enums";
import { waitForGridReady } from "@bciers/e2e/utils/helpers";

export class ReportAttachmentsListPOM {
  readonly page: Page;
  readonly url: string;

  constructor(page: Page) {
    this.page = page;
    this.url =
      process.env.E2E_BASEURL + AppRoutes.GRID_REPORTING_ATTACHMENTS_LIST;
  }

  async route(): Promise<void> {
    await this.page.goto(this.url);
    await waitForGridReady(this.page, { timeout: 30_000 });
  }

  async verifyPageTitle(): Promise<void> {
    await expect(
      this.page.getByRole("heading", { name: /Download Report Attachments/i }),
    ).toBeVisible();
  }

  async assertGridHasRows(): Promise<void> {
    await expect(this.page.getByRole("row").nth(1)).toBeVisible();
  }

  async filterByColumn(columnLabel: string, searchTerm: string): Promise<void> {
    const searchField = this.page
      .getByRole("columnheader", { name: `${columnLabel} search field` })
      .getByPlaceholder("Search");

    await searchField.clear();
    await searchField.fill(searchTerm);
    await expect(searchField).toHaveValue(searchTerm);
  }

  async sortByColumn(
    dataField: string,
    sortOrder: "asc" | "desc" = "asc",
  ): Promise<void> {
    await this.page.goto(
      `${this.url}?sort_field=${dataField}&sort_order=${sortOrder}`,
    );
    await waitForGridReady(this.page);
  }

  async assertNoRecordsFound(): Promise<void> {
    await expect(this.page.getByText(/No records found/i)).toBeVisible();
  }

  async assertAllVisibleRowsMatchYear(year: string): Promise<void> {
    await expect(
      this.page.getByRole("row").filter({ hasText: year }).first(),
    ).toBeVisible();

    // Rows containing a different 4-digit year must not be present.
    await expect(
      this.page
        .getByRole("row")
        .filter({ hasNotText: year })
        .filter({ hasText: /20\d\d/ }),
    ).toHaveCount(0);
  }

  // 2024 = oldest submitted year, 2025 = newest (from load fixture data)
  async assertSortedByReportingYear(order: "asc" | "desc"): Promise<void> {
    const dataRows = this.page.getByRole("row").filter({ hasText: /20\d\d/ });
    const [expectedFirst, expectedLast] =
      order === "asc" ? ["2024", "2025"] : ["2025", "2024"];

    await expect(dataRows.first()).toContainText(expectedFirst);
    await expect(dataRows.last()).toContainText(expectedLast);
  }

  async clickDownloadAndAwaitServerAction(): Promise<void> {
    const downloadButton = this.page
      .getByRole("button")
      .filter({ hasText: /file1\.pdf/i })
      .first();

    await expect(downloadButton).toBeVisible({ timeout: 10_000 });

    // Listener must be registered before the click so the request isn't missed.
    const serverActionPost = this.page.waitForRequest(
      (req) =>
        req.url().includes("/reporting/reports/attachments") &&
        req.method() === "POST",
      { timeout: 15_000 },
    );

    await downloadButton.click();
    await serverActionPost;
  }
}
