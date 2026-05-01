import { setupBeforeAllTest } from "@bciers/e2e/setupBeforeAll";
import { UserRole } from "@bciers/e2e/utils/enums";
import {
  FacilityIDs,
  OPERATION_NAMES,
  ReportRoutes,
} from "@/reporting-e2e/utils/enums";
import { CurrentReportsPOM } from "@/reporting-e2e/poms/current-reports";
import { CurrentReportPOM } from "@/reporting-e2e/poms/current-report";
import { ReportSetUpPOM } from "@/reporting-e2e/poms/report-setup";
import { LFOFacilityReportPOM } from "@/reporting-e2e/poms/facility-report";
import { ReviewFacilitiesPOM } from "@/reporting-e2e/poms/LFO/review-facilities";
import { FacilityGridPOM } from "@/reporting-e2e/poms/LFO/facility-grid";
import { OperationEmissionSummaryPOM } from "@/reporting-e2e/poms/LFO/operation-emissions-summary";
import { verifyFormTitle } from "@/reporting-e2e/utils/helpers";
import { takeStabilizedScreenshot } from "@bciers/e2e/utils/helpers";
import { expect } from "@playwright/test";

const test = setupBeforeAllTest(UserRole.INDUSTRY_USER_ADMIN);

test.describe.configure({ mode: "serial" });

test.describe("LFO: create and submit a new report for the current reporting year", () => {
  test("Industry user starts, fills, and submits a new LFO report", async ({
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

    // ── 2. Click "Start" for Bees LFO — creates the report and navigates to
    //       review-operation-information; ──
    await grid.searchByOperationName(OPERATION_NAMES.BEES_LFO);

    const versionId = await grid.startNewReportForOperation(
      OPERATION_NAMES.BEES_LFO,
    );
    const report = new CurrentReportPOM(page);

    // ── 3. Review Operation Information
    await verifyFormTitle(page, "Review Operation Information");
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "LFO Report - Review Operation Information",
      variant: "filled",
    });
    await report.saveAndContinue(
      new RegExp(report.personResponsibleUrl(versionId)),
    );

    // ── 4. Person Responsible — select "Bill Blue" (contact linked to the op)
    await report.fillPersonResponsible("Bill Blue");
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "LFO Report - Person Responsible",
      variant: "filled",
    });
    await report.saveAndContinue(
      new RegExp(report.reviewFacilitiesUrl(versionId)),
    );

    // ── 5. Review Facilities
    const reviewFacility = new ReviewFacilitiesPOM(page);
    await reviewFacility.selectFacilities(["Facility 38"]);
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "LFO Report - Review Facilities",
      variant: "filled",
    });
    await report.saveAndContinue(
      new RegExp(report.facilitiesGridUrl(versionId)),
    );

    // LFO Specific flow items
    // ── 6. Facility Grid
    const facilityGrid = new FacilityGridPOM(page, versionId);
    await facilityGrid.waitForReady();
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "LFO Report - Facility Grid",
      variant: "not started",
    });
    const facilityId =
      await facilityGrid.continueReportForFacility("Facility 38");

    // ── 7. Review Facility Information
    const facilityReport = new LFOFacilityReportPOM(page, facilityId);
    await facilityReport.fillReviewFacilityInformation();
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "LFO Report - Review Facility",
      variant: "filled",
    });
    await facilityReport.saveAndContinue(
      new RegExp(report.activitiesUrl(versionId, FacilityIDs.BEES_LFO), "i"),
    );

    // ── 8. Activities — GSC with 1 unit, 1 fuel (Diesel), 1 emission (CO2) ──
    await facilityReport.fillGscActivity();
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "LFO Report - Activities",
      variant: "filled",
    });
    await facilityReport.saveAndContinue(
      new RegExp(facilityReport.nonAttributableUrl()),
    );

    // ── 9. Non-Attributable Emissions (no entries needed) ──
    await facilityReport.fillNonAttributable();
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "LFO Report - Non-Attributable Emissions",
      variant: "filled",
    });
    await facilityReport.saveAndContinue(
      new RegExp(facilityReport.emissionsSummaryUrl()),
    );

    // ── 10. Emission Summary (read-only) ──
    await facilityReport.verifyEmissionSummary();
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "LFO Report - Emission Summary",
      variant: "default",
    });
    await facilityReport.clickContinue(
      new RegExp(facilityReport.productionDataUrl()),
    );

    // ── 11. Production Data — select Cement equivalent, fill annual production ──
    await facilityReport.fillProductionData(
      ["Compression, positive displacement - consumed energy"],
      ["Compression, positive displacement - consumed energy"],
    );
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "LFO Report - Production Data",
      variant: "filled",
    });
    await facilityReport.clickContinue(
      new RegExp(facilityReport.allocationOfEmissionsUrl()),
    );

    // ── 12. Allocation of Emissions (no entries needed for minimal test) ──
    await facilityReport.fillAllocationOfEmissions();
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "LFO Report - Allocation of Emissions",
      variant: "filled",
    });
    await facilityReport.clickContinue(
      new RegExp(facilityReport.facilityReportCompletedUrl()),
    );

    // -- 13. Facility report completed
    await facilityReport.verifyFacilityReportCompleted();
    await facilityReport.returnToAllFacilityReports();

    await facilityGrid.markFacilityComplete("Facility 38");
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "LFO Report - Facility Grid",
      variant: "completed",
    });
    await facilityGrid.clickContinue();

    // ── 14. Additional Reporting Data — no captured emissions ──
    await report.fillAdditionalData();
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "LFO Report - Additional Reporting Data",
      variant: "filled",
    });
    await report.saveAndContinue();

    // ── 15. Operation Emission Summary (read-only) ──
    const operationEmissionSummary = new OperationEmissionSummaryPOM(page);
    await operationEmissionSummary.validateEmissionSummary();
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "LFO Report - Emission Summary",
      variant: "default",
    });
    await operationEmissionSummary.continue(
      new RegExp(`${versionId}/${ReportRoutes.COMPLIANCE_SUMMARY}`),
    );

    // ── 16. Compliance Summary (read-only) ──
    await report.verifyComplianceSummary();
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "LFO Report - Compliance Summary",
      variant: "default",
    });
    await report.continue(
      new RegExp(`${versionId}/${ReportRoutes.VALIDATION}`),
    );

    // ── 17. Report Validation (read-only) ──
    await verifyFormTitle(page, "Report validation");
    await report.verifyReportValidation();
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "LFO Report - Report Validation",
      variant: "default",
    });
    await report.continue(
      new RegExp(`${versionId}/${ReportRoutes.FINAL_REVIEW}`),
    );

    // ── 18. Final Review (read-only) ──
    await report.verifyFinalReview();
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "LFO Report - Final Review",
      variant: "default",
    });
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByText("Verification body name")).toBeVisible();

    // await report.continue(
    //   new RegExp(`${versionId}/${ReportRoutes.VERIFICATION}`),
    // );

    // ── 19. Verification ──
    await verifyFormTitle(page, "Verification");
    await report.fillVerification();
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "LFO Report - Verification",
      variant: "filled",
    });
    await report.saveAndContinue(
      new RegExp(`${versionId}/${ReportRoutes.ATTACHMENTS}`),
    );

    // ── 20. Attachments — upload verification statement PDF ──
    await report.uploadVerificationStatement();
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "LFO Report - Attachments",
      variant: "filled",
    });
    await report.saveAndContinue(
      new RegExp(`${versionId}/${ReportRoutes.SIGN_OFF}`),
      false,
    );

    // ── 21. Sign-off and submit ──
    await grid.submitReportById(request, versionId, false, false, true);

    // ── 22. Submission page — verify success content ──
    await grid.verifySubmissionPage();
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "LFO Report - Submission",
      variant: "default",
    });

    // ── 23. Return to the grid and verify the report status ──
    await page.getByRole("link", { name: "Return to report table" }).click();
    await grid.verifyReportStatus(OPERATION_NAMES.BEES_LFO, "Submitted");
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "LFO Report - Current Reports Grid",
      variant: "submitted",
    });
  });
});
