import { setupBeforeAllTest } from "@bciers/e2e/setupBeforeAll";
import { UserRole } from "@bciers/e2e/utils/enums";
import { OPERATION_NAMES } from "@/reporting-e2e/utils/enums";
import { CurrentReportsPOM } from "@/reporting-e2e/poms/current-reports";
import { CurrentReportPOM } from "@/reporting-e2e/poms/current-report";
import { ReportSetUpPOM } from "@/reporting-e2e/poms/report-setup";
import { LFOFacilityReportPOM } from "@/reporting-e2e/poms/facility-report";

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
    //       review-operation-information; ──
    const versionId = await grid.startNewReportForOperation(
      OPERATION_NAMES.AIRPLANE_LFO,
    );
    const report = new CurrentReportPOM(page);

    // ── 3. Review Operation Information ──
    await report.continueFromOperationInfo(versionId);

    // ── 4. Person Responsible — select "Bill Blue" (contact linked to the op) ──
    await report.fillPersonResponsible(versionId, "Bill Blue");

    //
    //
    const facilityReport = new LFOFacilityReportPOM(page, "");
    // ... TODO: move methods below to the facility report POM

    // ── 5. Activities — GSC with 1 unit, 1 fuel (Diesel), 1 emission (CO2) ──
    await report.fillGscActivity();

    // ── 6. Non-Attributable Emissions (no entries needed) ──
    await report.fillNonAttributable();

    // ── 7. Emission Summary (read-only) ──
    await report.continueFromEmissionSummary();

    // ── 8. Production Data — select Cement equivalent, fill annual production ──
    await report.fillProductionData();

    // ── 9. Allocation of Emissions (no entries needed for minimal test) ──
    await report.fillAllocationOfEmissions();

    // ── 10. Additional Reporting Data — no captured emissions ──
    await report.fillAdditionalData();

    // ── 11. Compliance Summary (read-only) ──
    await report.continueFromComplianceSummary();

    // ── 12. Final Review (read-only) ──
    await report.continueFromFinalReview();

    // ── 13. Verification ──
    await report.fillVerification();

    // ── 14. Attachments — upload verification statement PDF ──
    await report.uploadVerificationStatement();

    // ── 15. Sign-off and submit ──
    await grid.submitReportById(request, versionId, false, false, true);
  });
});
