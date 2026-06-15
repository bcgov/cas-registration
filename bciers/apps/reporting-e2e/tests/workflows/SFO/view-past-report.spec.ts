import { setupBeforeAllTest } from "@bciers/e2e/setupBeforeAll";
import { UserRole } from "@bciers/e2e/utils/enums";
import { OPERATION_NAMES } from "@/reporting-e2e/utils/enums";
import { takeStabilizedScreenshot } from "@bciers/e2e/utils/helpers";
import { SubmittedPOM } from "@/reporting-e2e/poms/submitted";
import { AnnualReportPOM } from "@/reporting-e2e/poms/annual-report";
import { PastReportsPOM } from "@/reporting-e2e/poms/past-reports";

const test = setupBeforeAllTest(UserRole.INDUSTRY_USER_ADMIN);
const internalTest = setupBeforeAllTest(UserRole.CAS_ANALYST);

test.describe.configure({ mode: "serial" });

test.describe("SFO: view a submitted report for a past reporting year", () => {
  test("Industry user views a submitted SFO report", async ({
    page,
    happoScreenshot,
  }) => {
    // ── 1. Navigate to the past reports grid ──
    const grid = new PastReportsPOM(page);
    await grid.route();

    await grid.searchByYear("2024");
    await grid.searchByOperationName(OPERATION_NAMES.BANGLES_SFO);

    // ── 2. Click "View Details" for the report — navigates to the 'Submitted' report view ──
    await grid.viewDetailsFromReportGrid(OPERATION_NAMES.BANGLES_SFO, true);
    const submittedReport = new SubmittedPOM(page);

    await submittedReport.verifySubmittedReportView(
      OPERATION_NAMES.BANGLES_SFO,
      false,
    );

    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "SFO Past Report - Submitted",
      variant: "external",
    });
  });
});

internalTest.describe(
  "SFO: view a submitted report for a past reporting year",
  () => {
    internalTest(
      "CAS analyst views a submitted SFO report",
      async ({ page, happoScreenshot }) => {
        // ── 1. Navigate to the past reports grid ──
        const grid = new PastReportsPOM(page);
        await grid.route();

        await grid.searchByYear("2024");
        await grid.searchByOperationName(OPERATION_NAMES.BANGLES_SFO);

        // ── 2. Click "View Details" for the report — navigates to the 'Annual Report' view ──
        await grid.viewDetailsFromReportGrid(
          OPERATION_NAMES.BANGLES_SFO,
          false,
        );
        const annualReport = new AnnualReportPOM(page);

        await annualReport.verifySubmittedReportView(
          OPERATION_NAMES.BANGLES_SFO,
          false,
        );
        await takeStabilizedScreenshot(happoScreenshot, page, {
          component: "SFO Past Report - Submitted",
          variant: "internal",
        });
      },
    );
  },
);
