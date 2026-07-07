import { Page, expect } from "@playwright/test";
import { CurrentReportsPOM } from "@/reporting-e2e/poms/current-reports";
import { AppRoutes } from "@/reporting-e2e/utils/enums";
import { GRID_BUTTON_TEXT } from "@/reporting-e2e/utils/constants";
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

  async clickFileReport(): Promise<void> {
    const expectedUrl = new RegExp(`${AppRoutes.PAGE_START_PAST_REPORT}$`, "i");

    const link = this.page.getByRole("link", {
      name: GRID_BUTTON_TEXT.FILE_PREVIOUS_YEARS_REPORT,
    });

    await expect(link).toBeVisible({ timeout: 30_000 });
    await expect(link).toBeEnabled({ timeout: 30_000 });

    await link.click();

    await expect(this.page).toHaveURL(expectedUrl, {
      timeout: 30_000,
    });
  }
}
