import { setupBeforeAllTest } from "@bciers/e2e/setupBeforeAll";
import { UserRole } from "@bciers/e2e/utils/enums";
import {
  FacilityIDs,
  OPERATION_NAMES,
  ReportRoutes,
} from "@/reporting-e2e/utils/enums";
import { CurrentReportsPOM } from "@/reporting-e2e/poms/current-reports";
import { CurrentReportPOM } from "@/reporting-e2e/poms/current-report";
import { SFOFacilityReportPOM } from "@/reporting-e2e/poms/facility-report";
import { ReportSetUpPOM } from "@/reporting-e2e/poms/report-setup";
import {
  verifyFieldTemplateLabel,
  verifyFormTitle,
} from "@/reporting-e2e/utils/helpers";

const test = setupBeforeAllTest(UserRole.INDUSTRY_USER_ADMIN);

test.describe.configure({ mode: "serial" });

test.describe("SFO: create and submit a new report for the current reporting year", () => {
  test("Industry user starts, fills, and submits a new SFO report", async ({
    page,
    request,
  }) => {
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
    const facilityReport = new SFOFacilityReportPOM(
      page,
      FacilityIDs.BUGLE_SFO,
    );

    // ── 3. Review Operation Information ──
    await verifyFormTitle(page, "Review Operation Information");
    await report.verifyBugleSfoOperationInfo();
    // TODO: Add happo screenshot here
    await report.saveAndContinue(
      new RegExp(report.personResponsibleUrl(versionId), "i"),
    );

    // ── 4. Person Responsible — select "Bill Blue" (contact linked to the op) ──
    await verifyFormTitle(page, "Person Responsible");
    await report.fillPersonResponsible("Bill Blue");
    // TODO: add happo screenshot here
    await report.saveAndContinue(
      new RegExp(report.activitiesUrl(versionId, FacilityIDs.BUGLE_SFO), "i"),
    );

    // ── 5. Activities — GSC with 1 unit, 1 fuel (Diesel), 1 emission (CO2) ──
    await verifyFieldTemplateLabel(
      page,
      "General stationary combustion excluding line tracing (at SFO)",
    );
    await facilityReport.fillGscActivity();
    // TODO: add happo screenshot here
    await facilityReport.saveAndContinue(
      new RegExp(facilityReport.nonAttributableUrl(), "i"),
    );

    // ── 6. Non-Attributable Emissions (no entries needed) ──
    await verifyFieldTemplateLabel(page, "Non-Attributable Emissions");
    await facilityReport.fillNonAttributable();
    // TODO: add happo screenshot here
    await facilityReport.saveAndContinue(
      new RegExp(
        `/facilities/${FacilityIDs.BUGLE_SFO}/${ReportRoutes.EMISSION_SUMMARY}`,
      ),
    );

    // ── 7. Emission Summary (read-only) ──
    await facilityReport.verifyEmissionSummary();
    // TODO: add happo screenshot here
    await facilityReport.clickContinue(
      new RegExp(
        `/facilities/${FacilityIDs.BUGLE_SFO}/${ReportRoutes.PRODUCTION_DATA}`,
      ),
    );

    // ── 8. Production Data — select Cement equivalent, fill annual production ──
    await verifyFormTitle(page, "Production Data");
    await facilityReport.fillProductionData();
    // TODO: add happo screenshot here
    await facilityReport.saveAndContinue(
      new RegExp(
        `/facilities/${FacilityIDs.BUGLE_SFO}/${ReportRoutes.ALLOCATION_OF_EMISSIONS}`,
      ),
    );

    // ── 9. Allocation of Emissions (no entries needed for minimal test) ──
    await verifyFormTitle(page, "Allocation of Emissions");
    await facilityReport.fillAllocationOfEmissions();
    // TODO: add happo screenshot here
    await facilityReport.saveAndContinue(
      new RegExp(`${versionId}/${ReportRoutes.ADDITIONAL_REPORTING_DATA}`),
    );

    // ── 10. Additional Reporting Data — no captured emissions ──
    await verifyFormTitle(page, "Additional Reporting Data");
    await report.fillAdditionalData();
    // TODO: add happo screenshot here
    await report.saveAndContinue(
      new RegExp(`${versionId}/${ReportRoutes.COMPLIANCE_SUMMARY}`),
    );

    // ── 11. Compliance Summary (read-only) ──
    await report.verifyComplianceSummary();
    // TODO: add happo screenshot here
    await report.continue(
      new RegExp(`${versionId}/${ReportRoutes.FINAL_REVIEW}`),
    );

    // ── 12. Final Review (read-only) ──
    await report.continueFromFinalReview();
    // TODO: add happo screenshot here

    // ── 13. Verification ──
    await report.fillVerification();
    // TODO: add happo screenshot here

    // ── 14. Attachments — upload verification statement PDF ──
    await report.uploadVerificationStatement();
    // TODO: add happo screenshot here

    // ── 15. Sign-off and submit (submission stubbed to avoid external calls) ──
    await grid.submitReportById(request, versionId, false, false, true);
  });
});
