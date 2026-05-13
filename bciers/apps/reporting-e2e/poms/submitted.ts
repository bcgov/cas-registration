import { Page, expect } from "@playwright/test";
import { ReportRoutes } from "../utils/enums";
import { verifySaveAsPDF } from "@/reporting-e2e/utils/helpers";
import {
  ACTION_BUTTON_TEXT,
  REPORTING_REPORTS_BASE_PATH,
} from "@/reporting-e2e/utils/constants";
import { assertFieldVisibility } from "@bciers/e2e/utils/helpers";

export class SubmittedPOM {
  readonly page: Page;
  readonly urlRegex: RegExp;

  static readonly SUBMITTED_REPORT_FIELDS = [
    "Review Operation Information",
    "Person Responsible for Submitting Report",
    "Report Information",
    "Attachments",
    "Back To All Reports",
  ] as const;

  static readonly LFO_SUBMITTED_REPORT_FIELDS = [
    "Operation Emission Summary",
    "Compliance Summary",
  ] as const;

  static readonly SFO_SUBMITTED_REPORT_FIELDS = [
    "Non-Attributable Emissions",
    "Emissions Summary (in tCO2e)",
  ] as const;

  constructor(page: Page) {
    this.page = page;
    this.urlRegex = new RegExp(
      String.raw`${REPORTING_REPORTS_BASE_PATH}/\d+/${ReportRoutes.SUBMITTED_REPORT}`,
      "i",
    );
  }

  protected getReportFields(): readonly string[] {
    return SubmittedPOM.SUBMITTED_REPORT_FIELDS;
  }

  async verifySubmittedReportView(
    operationName: string,
    isLFO: boolean = false,
  ): Promise<void> {
    const fields = [operationName, ...this.getReportFields()];

    await assertFieldVisibility(
      this.page,
      fields.concat(
        isLFO
          ? SubmittedPOM.LFO_SUBMITTED_REPORT_FIELDS
          : SubmittedPOM.SFO_SUBMITTED_REPORT_FIELDS,
      ),
      true,
    );

    await verifySaveAsPDF(this.page);
  }

  async verifyFacilitySubmittedReportView(facilityName: string): Promise<void> {
    await assertFieldVisibility(
      this.page,
      [
        facilityName,
        "Report Information",
        "Non-Attributable Emissions",
        "Emissions Summary",
        "Allocation of Emissions",
      ],
      true,
    );

    await verifySaveAsPDF(this.page);
  }

  /**
   * Clicks the "View Details" button for a specific facility report
   * in the facility grid on the Submitted report view.
   */
  async viewDetailsFromFacilityGrid(
    facilityName: string,
    facilityId: string,
  ): Promise<void> {
    const row = this.page
      .getByRole("row")
      .filter({ hasText: facilityName })
      .first();
    //const row = await getGridRowByText(this.page, facilityName);
    await expect(row).toBeVisible();
    const viewFacilityReportDetailsButton = row.getByRole("button", {
      name: new RegExp(ACTION_BUTTON_TEXT.VIEW_DETAILS, "i"),
    });
    await expect(viewFacilityReportDetailsButton).toBeVisible();
    await expect(viewFacilityReportDetailsButton).toBeEnabled();

    const viewFacilityReportRoute = `${this.urlRegex.source}/facility/${facilityId}`;
    const routeRegex = new RegExp(String.raw`${viewFacilityReportRoute}`, "i");

    await expect(async () => {
      await viewFacilityReportDetailsButton.click({ trial: true });
    }).toPass({ timeout: 1000 });
    await this.page.waitForTimeout(1000); // TODO: figure out why this won't work without the wait
    await viewFacilityReportDetailsButton.click();
    await expect(this.page).toHaveURL(routeRegex, { timeout: 15_000 });
    // await Promise.all([
    //   this.page.waitForURL(
    //     (u) =>
    //       routeRegex.test(u.toString()),
    //     { waitUntil: "domcontentloaded" },
    //   ),
    //   viewFacilityReportDetailsButton.click(),
    // ]);
  }
}
