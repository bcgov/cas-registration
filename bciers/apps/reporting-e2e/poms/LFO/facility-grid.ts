import { Page, expect } from "@playwright/test";
import { AppRoutes, ReportRoutes } from "../../utils/enums";
import { clickButton, waitForGridReady } from "@bciers/e2e/utils/helpers";
import { FORM_BUTTON_TEXT } from "@/reporting-e2e/utils/constants";

export class FacilityGridPOM {
  readonly page: Page;
  readonly url: string;

  constructor(page: Page, versionId: number) {
    this.page = page;
    this.url = `${process.env.E2E_BASEURL}${AppRoutes.GRID_REPORTING_CURRENT_REPORTS}/
                            ${versionId}/${ReportRoutes.FACILITY_REPORT_GRID}`;
  }

  // Page methods
  async waitForReady(): Promise<void> {
    await waitForGridReady(this.page, { timeout: 30_000 });
  }

  async continueReportForFacility(facilityName: string): Promise<string> {
    await waitForGridReady(this.page);

    const row = this.page
      .getByRole("row")
      .filter({ hasText: facilityName })
      .first();

    await expect(row).toBeVisible();

    const continueLink = row.getByRole("link", { name: "Continue" });
    await expect(continueLink).toBeVisible();
    await expect(continueLink).toBeEnabled();

    await continueLink.click();

    await expect(async () => {
      await expect(
        this.page.getByText("Review Facility Information").first(),
      ).toBeVisible();
    }).toPass({ timeout: 30_000 });
    return this.extractFacilityIdFromUrl(this.page);
  }

  async markFacilityComplete(facilityName: string) {
    await this.page
      .getByRole("row")
      .filter({ hasText: facilityName })
      .first()
      .getByRole("checkbox", { name: "Report Status" })
      .setChecked(true);
    await this.page.waitForTimeout(500);
  }

  async clickContinue(waitForUrl?: RegExp): Promise<void> {
    await clickButton(this.page, FORM_BUTTON_TEXT.CONTINUE, { waitForUrl });
  }

  // Utils
  private extractFacilityIdFromUrl(page: Page): string {
    // .../reporting/reports/31/facilities/dadadada-1234-5678-9012-dadadadadada/review-facility-information
    const url = new URL(page.url());
    const parts = url.pathname.split("/").filter(Boolean);

    return parts.at(-2) ?? "";
  }
}
