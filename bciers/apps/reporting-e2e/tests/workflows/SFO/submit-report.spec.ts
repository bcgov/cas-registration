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
import { takeStabilizedScreenshot } from "@bciers/e2e/utils/helpers";
import { verifyFormTitle } from "@/reporting-e2e/utils/helpers";

const test = setupBeforeAllTest(UserRole.INDUSTRY_USER_ADMIN);

test.describe.configure({ mode: "serial" });

test.describe("SFO: create and submit a new report for the current reporting year", () => {
  test("Industry user starts, fills, and submits a new SFO report", async ({
    page,
    request,
    happoScreenshot,
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
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "SFO Report - Review Operation Information",
      variant: "filled",
    });
    await report.saveAndContinue(
      new RegExp(report.personResponsibleUrl(versionId), "i"),
    );

    // ── 4. Person Responsible — select "Bill Blue" (contact linked to the op) ──
    await verifyFormTitle(page, "Person Responsible for Submitting Report");
    await report.fillPersonResponsible("Bill Blue");
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "SFO Report - Person Responsible",
      variant: "filled",
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
      component: "SFO Report - Activities",
      variant: "filled",
    });
    await facilityReport.saveAndContinue(
      new RegExp(facilityReport.nonAttributableUrl(), "i"),
    );

    // ── 6. Non-Attributable Emissions (no entries needed) ──
    await verifyFormTitle(page, "Non-Attributable Emissions");
    await facilityReport.fillNonAttributable();
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "SFO Report - Non-Attributable Emissions",
      variant: "filled",
    });
    await facilityReport.saveAndContinue(
      new RegExp(
        `/facilities/${FacilityIDs.BUGLE_SFO}/${ReportRoutes.EMISSION_SUMMARY}`,
      ),
    );

    // ── 7. Emission Summary (read-only) ──
    await facilityReport.verifyEmissionSummary();
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "SFO Report - Emission Summary",
      variant: "default",
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
      component: "SFO Report - Production Data",
      variant: "filled",
    });
    await facilityReport.saveAndContinue(
      new RegExp(
        `/facilities/${FacilityIDs.BUGLE_SFO}/${ReportRoutes.ALLOCATION_OF_EMISSIONS}`,
      ),
    );

    // ── 9. Allocation of Emissions ──
    await verifyFormTitle(page, "Allocation of Emissions");
    await facilityReport.fillAllocationOfEmissions();
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "SFO Report - Allocation of Emissions",
      variant: "filled",
    });
    await facilityReport.saveAndContinue(
      new RegExp(`${versionId}/${ReportRoutes.ADDITIONAL_REPORTING_DATA}`),
    );

    // ── 10. Additional Reporting Data ──
    await verifyFormTitle(page, "Additional Reporting Data");
    await report.fillAdditionalData();
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "SFO Report - Additional Reporting Data",
      variant: "filled",
    });
    await report.saveAndContinue(
      new RegExp(`${versionId}/${ReportRoutes.COMPLIANCE_SUMMARY}`),
    );

    // ── 11. Compliance Summary (read-only) ──
    await report.verifyComplianceSummary();
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "SFO Report - Compliance Summary",
      variant: "default",
    });
    await report.continue(
      new RegExp(`${versionId}/${ReportRoutes.FINAL_REVIEW}`),
    );

    // ── 12. Final Review (read-only) ──
    await report.verifyFinalReview();
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "SFO Report - Final Review",
      variant: "default",
    });
    await report.continue(
      new RegExp(`${versionId}/${ReportRoutes.VERIFICATION}`),
    );

    // ── 13. Verification ──
    await verifyFormTitle(page, "Verification");
    await report.fillVerification();
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "SFO Report - Verification",
      variant: "filled",
    });
    await report.saveAndContinue(
      new RegExp(`${versionId}/${ReportRoutes.ATTACHMENTS}`),
    );

    // ── 14. Attachments — upload verification statement PDF ──
    await report.uploadVerificationStatement();
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "SFO Report - Attachments",
      variant: "filled",
    });
    await report.saveAndContinue(
      new RegExp(`${versionId}/${ReportRoutes.SIGN_OFF}`),
      false,
    );

    // ── 15. Sign-off and submit (submission stubbed to avoid external calls) ──
    await grid.submitReportById(request, versionId, false, false, true);

    // ── 16. Submission page — verify success content ──
    await grid.verifySubmissionPage();
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "SFO Report - Submission",
      variant: "default",
    });

    // ── 17. Return to grid and verify report status ──
    await page.getByRole("link", { name: "Return to report table" }).click();
    await grid.verifyReportStatus(OPERATION_NAMES.BUGLE_SFO, "Submitted");
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "SFO Report - Current Reports Grid",
      variant: "submitted",
    });
  });
});
