import { Page, expect } from "@playwright/test";
import { ReportRoutes } from "@/reporting-e2e/utils/enums";
import { FORM_BUTTON_TEXT } from "@/reporting-e2e/utils/constants";
import { clickButton } from "@bciers/e2e/utils/helpers";
import { verifyFormTitle } from "@/reporting-e2e/utils/helpers";
import { PersonResponsiblePOM } from "@/reporting-e2e/poms/person-responsible";
import { ReportOperationPOM } from "@/reporting-e2e/poms/report-operation";
import { AdditionalReportingDataPOM } from "@/reporting-e2e/poms/additional-reporting-data";
import { VerificationPOM } from "@/reporting-e2e/poms/verification";
import { AttachmentsPOM } from "@/reporting-e2e/poms/attachments";
import { ReportValidationPOM } from "@/reporting-e2e/poms/report-validation";

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

  async saveAndContinue(
    waitForUrl?: RegExp,
    inForm: boolean = true,
  ): Promise<void> {
    await clickButton(this.page, FORM_BUTTON_TEXT.SAVE_AND_CONTINUE, {
      inForm,
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

  async verifyReportValidation(): Promise<void> {
    const validation = new ReportValidationPOM(this.page);
    await validation.verifyNoIssues();
  }

  async verifyComplianceSummary(): Promise<void> {
    await verifyFormTitle(this.page, "Compliance Summary");
  }

  async verifyFinalReview(): Promise<void> {
    await expect(
      this.page.getByRole("button", { name: /save as pdf/i }),
    ).toBeVisible();
  }

  async fillVerification(): Promise<void> {
    const verification = new VerificationPOM(this.page);
    await verification.fill();
  }

  async uploadVerificationStatement(): Promise<void> {
    const attachments = new AttachmentsPOM(this.page);
    await attachments.uploadVerificationStatement();
  }
}
