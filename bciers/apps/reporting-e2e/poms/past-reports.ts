import { Page, expect } from "@playwright/test";
import { CurrentReportsPOM } from "@/reporting-e2e/poms/current-reports";
import { AppRoutes } from "../utils/enums";
import { waitForGridReady } from "@bciers/e2e/utils/helpers";

export class PastReportsPOM extends CurrentReportsPOM {
  readonly url: string =
    process.env.E2E_BASEURL + AppRoutes.GRID_REPORTING_PAST_REPORTS;
  readonly subdirectory: string = "previous-years";

  constructor(page: Page) {
    super(page);
  }

  async searchByYear(year: string): Promise<void> {
    const reportingYearSearchField = this.page
      .getByRole("columnheader", { name: "Reporting Year search field" })
      .getByPlaceholder("Search");

    await reportingYearSearchField.fill(year);
    await expect(reportingYearSearchField).toHaveValue(year);
    await this.page.waitForURL(
      (u) =>
        u.searchParams.get("reporting_year") === year &&
        new RegExp(`/${this.subdirectory}/?$`, "i").test(u.pathname),
      { timeout: 10_000 },
    );

    await waitForGridReady(this.page);

    const row = this.page.getByRole("row").filter({ hasText: year }).first();

    await expect(row).toBeVisible({ timeout: 30_000 });
  }
}
