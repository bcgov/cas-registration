import { Page } from "@playwright/test";
import {
  AppRoutes,
  FacilityIDs,
  ReportRoutes,
} from "@/reporting-e2e/utils/enums";
import {
  FORM_BUTTON_TEXT,
} from "@/reporting-e2e/utils/constants";
import {
  clickButton,
  selectItemFromAutocomplete,
} from "@bciers/e2e/utils/helpers";

export class CurrentReportPOM {
  readonly page: Page;

  private readonly baseUrl: string;

  constructor(page: Page) {
    this.page = page;
    this.baseUrl =
      process.env.E2E_BASEURL + AppRoutes.GRID_REPORTING_CURRENT_REPORTS;
  }

  // -----------------
  // URL builders
  // -----------------
  private personResponsibleUrl(versionId: number): string {
    return `${this.baseUrl}/${versionId}/${ReportRoutes.PERSON_RESPONSIBLE}`;
  }

  private activitiesUrl(
    versionId: number,
    facilityId: string,
    step = 0,
  ): string {
    return `${this.baseUrl}/${versionId}/${ReportRoutes.FACILITIES}/${facilityId}/${ReportRoutes.ACTIVITIES}?step=${step}`;
  }

  // -----------------
  // Shared helpers
  // -----------------

  private async saveAndContinue(waitForUrl?: RegExp): Promise<void> {
    await clickButton(this.page, FORM_BUTTON_TEXT.SAVE_AND_CONTINUE, {
      inForm: true,
      waitForUrl,
    });
  }

  // -----------------
  // Page 1 — Review Operation Information
  // -----------------

  async continueFromOperationInfo(versionId: number): Promise<void> {
    await this.saveAndContinue(
      new RegExp(this.personResponsibleUrl(versionId)),
    );
  }

  // -----------------
  // Page 2 — Person Responsible
  // -----------------

  async fillPersonResponsible(
    versionId: number,
    contactName: string,
  ): Promise<void> {
    await selectItemFromAutocomplete(this.page, contactName);
    await this.saveAndContinue(
      new RegExp(this.activitiesUrl(versionId, FacilityIDs.BUGLE_SFO, 0)),
    );
  }

  // -----------------
  // Page 3 — Activities (GSC excluding line tracing)
  // -----------------

  async fillGscActivity(): Promise<void> {}

  // -----------------
  // Page 4 — Non-Attributable Emissions
  // -----------------

  async fillNonAttributable(): Promise<void> {}

  // -----------------
  // Page 5 — Emission Summary (read-only)
  // -----------------

  async continueFromEmissionSummary(
  ): Promise<void> {}

  // -----------------
  // Page 6 — Production Data
  // -----------------

  async fillProductionData(
  ): Promise<void> {}

  // -----------------
  // Page 7 — Allocation of Emissions
  // -----------------

  async fillAllocationOfEmissions(): Promise<void> {}

  // -----------------
  // Page 8 — Additional Reporting Data
  // -----------------

  async fillAdditionalData(): Promise<void> {}

  // -----------------
  // Page 9 — Compliance Summary (read-only)
  // -----------------

  async continueFromComplianceSummary(): Promise<void> {}

  // -----------------
  // Page 10 — Final Review (read-only)
  // -----------------

  async continueFromFinalReview(): Promise<void> {}

  // -----------------
  // Page 11 — Verification
  // -----------------

  async fillVerification(): Promise<void> {}

  // -----------------
  // Page 12 — Attachments
  // -----------------

  async uploadVerificationStatement(): Promise<void> {}
}
