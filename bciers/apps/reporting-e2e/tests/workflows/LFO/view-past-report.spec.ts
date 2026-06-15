import { setupBeforeAllTest } from "@bciers/e2e/setupBeforeAll";
import { UserRole } from "@bciers/e2e/utils/enums";
import { FacilityIDs, OPERATION_NAMES } from "@/reporting-e2e/utils/enums";
import { takeStabilizedScreenshot } from "@bciers/e2e/utils/helpers";
import { SubmittedPOM } from "@/reporting-e2e/poms/submitted";
import { AnnualReportPOM } from "@/reporting-e2e/poms/annual-report";
import { PastReportsPOM } from "@/reporting-e2e/poms/past-reports";
import { ReportHistoryPOM } from "@/reporting-e2e/poms/report-history";

const test = setupBeforeAllTest(UserRole.INDUSTRY_USER_ADMIN);
const internalTest = setupBeforeAllTest(UserRole.CAS_ANALYST);

test.describe.configure({ mode: "serial" });

test.describe("LFO: An industry user views a submitted report for a past reporting year", () => {
  test("Industry user views a submitted LFO report", async ({
    page,
    happoScreenshot,
  }) => {
    // ── 1. Navigate to the past reports grid ──
    const grid = new PastReportsPOM(page);
    await grid.route();
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "Past Reports Grid",
      variant: "external",
    });
    await grid.searchByYear("2024");
    await grid.searchByOperationName(OPERATION_NAMES.BANANA_LFO);

    // ── 2. Click "View Details" for the report — navigates to the 'Submitted' report view ──
    await grid.reportHistoryForOperation(OPERATION_NAMES.BANANA_LFO, "2024");
    const historyGrid = new ReportHistoryPOM(page);
    await historyGrid.viewDetailsFromReportHistory(1);

    const submittedReport = new SubmittedPOM(page);
    await submittedReport.verifySubmittedReportView(
      OPERATION_NAMES.BANANA_LFO,
      true,
    );

    // ── 3. Click "View Details" for a specific facility in the facility grid ──
    await submittedReport.viewDetailsFromFacilityGrid(
      "Facility 1",
      FacilityIDs.BANANA_LFO_1,
    );
    await submittedReport.verifyFacilitySubmittedReportView("Facility 1");
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "LFO Past Facility Report - Submitted",
      variant: "external",
    });
  });
});

internalTest.describe(
  "LFO: An internal user views a submitted report for a past reporting year",
  () => {
    internalTest(
      "CAS analyst views a submitted LFO report",
      async ({ page, happoScreenshot }) => {
        // ── 1. Navigate to the past reports grid ──
        const grid = new PastReportsPOM(page);
        await grid.route();
        await takeStabilizedScreenshot(happoScreenshot, page, {
          component: "Past Reports Grid",
          variant: "internal",
        });

        await grid.searchByYear("2024");
        await grid.searchByOperationName(OPERATION_NAMES.BANANA_LFO);

        // ── 2. Click "View Details" for the report — navigates to the 'Annual Report' view ──
        await grid.viewDetailsFromReportGrid(
          OPERATION_NAMES.BANANA_LFO,
          false,
          "2024",
        );

        const annualReport = new AnnualReportPOM(page);
        await annualReport.verifySubmittedReportView(
          OPERATION_NAMES.BANANA_LFO,
          true,
        );

        // ── 3. Click "View Details" for a specific facility in the facility grid ──
        await annualReport.viewDetailsFromFacilityGrid(
          "Facility 1",
          FacilityIDs.BANANA_LFO_1,
        );
        await annualReport.verifyFacilitySubmittedReportView("Facility 1");
        await takeStabilizedScreenshot(happoScreenshot, page, {
          component: "LFO Past Facility Report - Submitted",
          variant: "internal",
        });
      },
    );
  },
);
