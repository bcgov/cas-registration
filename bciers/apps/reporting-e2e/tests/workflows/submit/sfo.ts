import {
  FacilityIDs,
  OPERATION_NAMES,
  REPORT_STATUS,
  ReportRoutes,
} from "@/reporting-e2e/utils/enums";
import { ACTION_BUTTON_TEXT } from "@/reporting-e2e/utils/constants";
import { CurrentReportsPOM } from "@/reporting-e2e/poms/current-reports";
import { CurrentReportPOM } from "@/reporting-e2e/poms/current-report";
import { SFOFacilityReportPOM } from "@/reporting-e2e/poms/facility-report";
import { ReportSetUpPOM } from "@/reporting-e2e/poms/report-setup";
import { takeStabilizedScreenshot } from "@bciers/e2e/utils/helpers";
import { verifyFormTitle } from "@/reporting-e2e/utils/helpers";
import { WorkflowRunnerArgs } from "@bciers/e2e/utils/types";

export async function runSfoSubmitReport({
  page,
  request,
  happoScreenshot,
}: WorkflowRunnerArgs) {
  // ── 0. Open the current reporting year so the "Start" button is available ──
  const setup = new ReportSetUpPOM(page);
  await setup.primeReportingYear("open");

  // ── 1. Navigate to the current reports grid ──
  const grid = new CurrentReportsPOM(page);
  await grid.route();

  // ── 2. Click "Start" for Bugle SFO — creates the report and navigates to
  //       review-operation-information ──
  const versionId = await grid.startNewReportForOperation(
    OPERATION_NAMES.BUGLE_SFO,
  );
  const report = new CurrentReportPOM(page);
  const facilityReport = new SFOFacilityReportPOM(page, FacilityIDs.BUGLE_SFO);

  // ── 3. Review Operation Information ──
  await verifyFormTitle(page, "Review Operation Information");
  await report.verifyBugleSfoOperationInfo();
  await takeStabilizedScreenshot(happoScreenshot, page, {
    component: "Report - Review Operation Information",
    variant: "SFO",
  });
  await report.saveAndContinue(
    new RegExp(report.personResponsibleUrl(versionId), "i"),
  );

  // ── 4. Person Responsible — select "Bill Blue" (contact linked to the op) ──
  await verifyFormTitle(page, "Person Responsible for Submitting Report");
  await report.fillPersonResponsible("Bill Blue");
  await takeStabilizedScreenshot(happoScreenshot, page, {
    component: "Report - Person Responsible",
    variant: "SFO",
  });
  await report.saveAndContinue(
    new RegExp(report.activitiesUrl(versionId, FacilityIDs.BUGLE_SFO), "i"),
  );

  // ── 5. Activities — GSC with 1 unit, 1 fuel (Diesel), 1 emission (CO2) ──
  await verifyFormTitle(
    page,
    "General stationary combustion excluding line tracing (at SFO)",
  );
  await facilityReport.fillGscActivity();
  await takeStabilizedScreenshot(happoScreenshot, page, {
    component: "Report - Activities",
    variant: "SFO",
  });
  await facilityReport.saveAndContinue(
    new RegExp(facilityReport.nonAttributableUrl(), "i"),
  );

  // ── 6. Non-Attributable Emissions (no entries needed) ──
  await verifyFormTitle(page, "Non-Attributable Emissions");
  await facilityReport.fillNonAttributable();
  await takeStabilizedScreenshot(happoScreenshot, page, {
    component: "Report - Non-Attributable Emissions",
    variant: "SFO",
  });
  await facilityReport.saveAndContinue(
    new RegExp(
      `/facilities/${FacilityIDs.BUGLE_SFO}/${ReportRoutes.EMISSION_SUMMARY}`,
    ),
  );

  // ── 7. Emission Summary (read-only) ──
  await facilityReport.verifyEmissionSummary();
  await takeStabilizedScreenshot(happoScreenshot, page, {
    component: "Report - Emission Summary",
    variant: "SFO",
  });
  await facilityReport.clickContinue(
    new RegExp(
      `/facilities/${FacilityIDs.BUGLE_SFO}/${ReportRoutes.PRODUCTION_DATA}`,
    ),
  );

  // ── 8. Production Data — select Cement equivalent, fill annual production ──
  await verifyFormTitle(page, "Production Data");
  await facilityReport.fillProductionData();
  await takeStabilizedScreenshot(happoScreenshot, page, {
    component: "Report - Production Data",
    variant: "SFO",
  });
  await facilityReport.saveAndContinue(
    new RegExp(
      `/facilities/${FacilityIDs.BUGLE_SFO}/${ReportRoutes.ALLOCATION_OF_EMISSIONS}`,
    ),
  );

  // ── 9. Allocation of Emissions ──
  await verifyFormTitle(page, "Allocation of Emissions");
  await facilityReport.verifyAllocationAlerts();
  await facilityReport.fillAllocationOfEmissions();
  await takeStabilizedScreenshot(happoScreenshot, page, {
    component: "Report - Allocation of Emissions",
    variant: "SFO",
  });
  await facilityReport.saveAndContinue(
    new RegExp(`${versionId}/${ReportRoutes.ADDITIONAL_REPORTING_DATA}`),
  );

  // ── 10. Additional Reporting Data ──
  await verifyFormTitle(page, "Additional Reporting Data");
  await report.fillAdditionalData();
  await takeStabilizedScreenshot(happoScreenshot, page, {
    component: "Report - Additional Reporting Data",
    variant: "SFO",
  });
  await report.saveAndContinue(
    new RegExp(`${versionId}/${ReportRoutes.COMPLIANCE_SUMMARY}`),
  );

  // ── 11. Compliance Summary (read-only) ──
  await report.verifyComplianceSummary();
  await takeStabilizedScreenshot(happoScreenshot, page, {
    component: "Report - Compliance Summary",
    variant: "SFO",
  });
  await report.continue(new RegExp(`${versionId}/${ReportRoutes.VALIDATION}`));

  // ── 12. Report Validation (read-only) ──
  await verifyFormTitle(page, "Report validation");
  await report.verifyReportValidation();
  await takeStabilizedScreenshot(happoScreenshot, page, {
    component: "Report - Report Validation",
    variant: "SFO",
  });
  await report.continue(
    new RegExp(`${versionId}/${ReportRoutes.FINAL_REVIEW}`),
  );

  // ── 13. Final Review (read-only) ──
  await report.verifyFinalReview();
  await takeStabilizedScreenshot(happoScreenshot, page, {
    component: "Report - Final Review",
    variant: "SFO",
  });
  await report.continue(
    new RegExp(`${versionId}/${ReportRoutes.VERIFICATION}`),
  );

  // ── 14. Verification ──
  await verifyFormTitle(page, "Verification");
  await report.fillVerification();
  await takeStabilizedScreenshot(happoScreenshot, page, {
    component: "Report - Verification",
    variant: "SFO - non-supplementary",
  });
  await report.saveAndContinue(
    new RegExp(`${versionId}/${ReportRoutes.ATTACHMENTS}`),
  );

  // ── 15. Attachments — upload verification statement PDF ──
  await report.uploadVerificationStatement();
  await takeStabilizedScreenshot(happoScreenshot, page, {
    component: "Report - Attachments",
    variant: "SFO - non-supplementary",
  });
  await report.saveAndContinue(
    new RegExp(`${versionId}/${ReportRoutes.SIGN_OFF}`),
    false,
  );

  // ── 16. Sign-off and submit ──
  await grid.completeSignOffAcknowledgements();
  await takeStabilizedScreenshot(happoScreenshot, page, {
    component: "Report - Sign-off",
    variant: "SFO - non-supplementary",
  });
  await grid.fillSignature();
  await grid.submitSignedReport(request, versionId, { isRegulated: true });

  // ── 17. Submission page — verify success content ──
  await grid.verifySubmissionPage();
  await takeStabilizedScreenshot(happoScreenshot, page, {
    component: "Report - Submission",
    variant: "SFO - non-supplementary",
  });

  // ── 18. Return to the grid and verify the report status ──
  await page
    .getByRole("link", { name: ACTION_BUTTON_TEXT.RETURN_TO_REPORT_TABLE })
    .click();
  await grid.verifyReportStatus(
    OPERATION_NAMES.BUGLE_SFO,
    REPORT_STATUS.SUBMITTED,
  );
}
