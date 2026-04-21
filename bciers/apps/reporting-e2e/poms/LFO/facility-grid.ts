import { Page, expect } from "@playwright/test";
import { AppRoutes, ReportRoutes } from "../../utils/enums";
import { waitForGridReady } from "@bciers/e2e/utils/helpers";

export class FacilityGridPOM {
  readonly page: Page;
  readonly url: string;

  constructor(page: Page, versionId: number) {
    this.page = page;
    this.url = `${process.env.E2E_BASEURL}${AppRoutes.GRID_REPORTING_CURRENT_REPORTS}/
                            ${versionId}/${ReportRoutes.FACILITY_REPORT_GRID}`;
  }

  // Page methods
  async route(): Promise<void> {
    await this.page.goto(this.url);
    await waitForGridReady(this.page, { timeout: 30_000 });
  }

  async continueReportForFacility(facilityName: string): Promise<string> {
    await waitForGridReady(this.page);

    const row = this.page
      .getByRole("row")
      .filter({ hasText: facilityName })
      .first();

    await expect(row).toBeVisible();

    const continueButton = row.getByRole("button", { name: "Continue" });
    await expect(continueButton).toBeVisible();
    await expect(continueButton).toBeEnabled();

    await Promise.all([
      continueButton.click(),
      // this.page.waitForURL(
      //   ("**review-facility-information"),
      //   { waitUntil: "domcontentloaded", timeout: 60_000 },
      // ),
    ]);

    await expect(async () => {
      await expect(
        this.page.getByText("Review Facility Information"),
      ).toBeVisible();
    }).toPass({ timeout: 30_000 });
    return this.extractFacilityIdFromUrl(this.page);
  }

  async markFacilityComplete(facilityName: string) {
    throw `${facilityName}`;
  }

  // Utils
  private extractFacilityIdFromUrl(page: Page): string {
    // .../reporting/reports/31/facilities/dadadada-1234-5678-9012-dadadadadada/review-facility-information
    const url = new URL(page.url());
    const parts = url.pathname.split("/").filter(Boolean);

    return parts[parts.length - 2];
  }
}
