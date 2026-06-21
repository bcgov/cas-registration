import { setupBeforeAllTest } from "@bciers/e2e/setupBeforeAll";
import { UserRole } from "@bciers/e2e/utils/enums";
import { FacilityIDs, OPERATION_NAMES } from "@/reporting-e2e/utils/enums";
import { CurrentReportsPOM } from "@/reporting-e2e/poms/current-reports";
import { takeStabilizedScreenshot } from "@bciers/e2e/utils/helpers";
import { SubmittedPOM } from "@/reporting-e2e/poms/submitted";
import { AnnualReportPOM } from "@/reporting-e2e/poms/annual-report";
import { ReportHistoryPOM } from "@/reporting-e2e/poms/report-history";

const test = setupBeforeAllTest(UserRole.INDUSTRY_USER_ADMIN);
const internalTest = setupBeforeAllTest(UserRole.CAS_ANALYST);

test.describe.configure({ mode: "serial" });

test.describe("LFO: view a submitted report for the current reporting year", () => {
  test("Industry user views a submitted LFO report", async ({
    page,
    happoScreenshot,
  }) => {
    // ── 1. Navigate to the current reports grid ──
    const grid = new CurrentReportsPOM(page);
    await grid.route();

    await grid.searchByOperationName(OPERATION_NAMES.BANANA_LFO);

    // ── 2. Click "View Details" for the report — navigates to the 'Submitted' report view ──
    await grid.reportHistoryForOperation(OPERATION_NAMES.BANANA_LFO);
    const historyGrid = new ReportHistoryPOM(page);
    await historyGrid.viewDetailsFromReportHistory(1);

    const submittedReport = new SubmittedPOM(page);
    await submittedReport.verifySubmittedReportView(
      OPERATION_NAMES.BANANA_LFO,
      true,
    );

    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "LFO Report - Submitted",
      variant: "external",
    });
    await submittedReport.viewDetailsFromFacilityGrid(
      "Facility 1",
      FacilityIDs.BANANA_LFO_1,
    );
    await submittedReport.verifyFacilitySubmittedReportView("Facility 1");
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "LFO Facility Report - Submitted",
      variant: "external",
    });
  });
});

internalTest.describe(
  "LFO: view a submitted report for the current reporting year",
  () => {
    internalTest(
      "CAS analyst views a submitted LFO report",
      async ({ page, happoScreenshot }) => {
        // ── 1. Navigate to the current reports grid ──
        const grid = new CurrentReportsPOM(page);
        await grid.route();

        await grid.searchByOperationName(OPERATION_NAMES.BANANA_LFO);

        // ── 2. Click "View Details" for the report — navigates to the 'Submitted' report view ──
        await grid.viewDetailsFromReportGrid(OPERATION_NAMES.BANANA_LFO, false);

        const submittedReport = new AnnualReportPOM(page);

        await submittedReport.verifySubmittedReportView(
          OPERATION_NAMES.BANANA_LFO,
          true,
        );

        await takeStabilizedScreenshot(happoScreenshot, page, {
          component: "LFO Report - Submitted",
          variant: "internal",
        });

        // -- 3. Click "View Details" for the facility report — navigates to the facility 'Submitted' report view ──
        await submittedReport.viewDetailsFromFacilityGrid(
          "Facility 1",
          FacilityIDs.BANANA_LFO_1,
        );
        await submittedReport.verifyFacilitySubmittedReportView("Facility 1");
        await takeStabilizedScreenshot(happoScreenshot, page, {
          component: "LFO Facility Report - Submitted",
          variant: "internal",
        });
      },
    );
  },
);
