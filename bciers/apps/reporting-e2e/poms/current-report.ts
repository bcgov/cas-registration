import { Page } from "@playwright/test";
import { ReportRoutes } from "@/reporting-e2e/utils/enums";
import { FORM_BUTTON_TEXT } from "@/reporting-e2e/utils/constants";
import { assertFieldVisibility, clickButton } from "@bciers/e2e/utils/helpers";
import { PersonResponsiblePOM } from "@/reporting-e2e/poms/person-responsible";
import { ReportOperationPOM } from "@/reporting-e2e/poms/report-operation";
import { AdditionalReportingDataPOM } from "@/reporting-e2e/poms/additional-reporting-data";

export class CurrentReportPOM {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // -----------------
  // URL builders
  // -----------------

  personResponsibleUrl(versionId: number): string {
    return `/reports/${versionId}/${ReportRoutes.PERSON_RESPONSIBLE}`;
  }

  reviewFacilitiesUrl(versionId: number): string {
    return `/reports/${versionId}/${ReportRoutes.REVIEW_FACILITIES}`;
  }

  facilitiesGridUrl(versionId: number): string {
    return `/reports/${versionId}/${ReportRoutes.FACILITY_REPORT_GRID}`;
  }

  activitiesUrl(versionId: number, facilityId: string): string {
    return `/reports/${versionId}/${ReportRoutes.FACILITIES}/${facilityId}/${ReportRoutes.ACTIVITIES}`;
  }

  // -----------------
  // Shared helpers
  // -----------------

  async saveAndContinue(waitForUrl?: RegExp): Promise<void> {
    await clickButton(this.page, FORM_BUTTON_TEXT.SAVE_AND_CONTINUE, {
      inForm: true,
      waitForUrl,
    });
  }

  async continue(waitForUrl?: RegExp): Promise<void> {
    await clickButton(this.page, FORM_BUTTON_TEXT.CONTINUE, {
      inForm: false,
      waitForUrl,
    });
  }

  async verifyBugleSfoOperationInfo(): Promise<void> {
    const operationReview = new ReportOperationPOM(this.page);
    await operationReview.verifyBugleSfoFields();
  }

  async fillPersonResponsible(contactName: string): Promise<void> {
    const personResponsible = new PersonResponsiblePOM(this.page);
    await personResponsible.selectContact(contactName);
  }

  async fillAdditionalData(): Promise<void> {
    const additionalReportingData = new AdditionalReportingDataPOM(this.page);
    await additionalReportingData.fill();
  }

  async verifyComplianceSummary(): Promise<void> {
    await assertFieldVisibility(this.page, ["Compliance Summary"], true);
  }

  async continueFromFinalReview(): Promise<void> {}

  async fillVerification(): Promise<void> {}

  async uploadVerificationStatement(): Promise<void> {}
}
