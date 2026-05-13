import { setupBeforeAllTest } from "@bciers/e2e/setupBeforeAll";
import { UserRole } from "@bciers/e2e/utils/enums";
import { OPERATION_NAMES } from "@/reporting-e2e/utils/enums";
import { CurrentReportsPOM } from "@/reporting-e2e/poms/current-reports";
import { takeStabilizedScreenshot } from "@bciers/e2e/utils/helpers";
import { SubmittedPOM } from "@/reporting-e2e/poms/submitted";
import { AnnualReportPOM } from "@/reporting-e2e/poms/annual-report";

const test = setupBeforeAllTest(UserRole.INDUSTRY_USER_ADMIN);
const internalTest = setupBeforeAllTest(UserRole.CAS_ANALYST);

test.describe.configure({ mode: "serial" });

test.describe("SFO: view a submitted report for the current reporting year", () => {
  test("Industry user views a submitted SFO report", async ({
    page,
    happoScreenshot,
  }) => {
    const isExternalUser = true;
    const isLFO = false;
    // ── 1. Navigate to the past reports grid ──
    const grid = new CurrentReportsPOM(page);
    await grid.route();

    await grid.searchByOperationName(OPERATION_NAMES.BANGLES_SFO);

    // ── 2. Click "View Details" for the report — navigates to the 'Submitted' report view ──
    await grid.viewDetailsFromReportGrid(
      OPERATION_NAMES.BANGLES_SFO,
      isExternalUser,
    );
    const submittedReport = new SubmittedPOM(page);

    await submittedReport.verifySubmittedReportView(
      OPERATION_NAMES.BANGLES_SFO,
      isLFO,
    );

    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "SFO Report - Submitted",
      variant: "external",
    });
  });
});

internalTest.describe(
  "SFO: view a submitted report for the current reporting year",
  () => {
    internalTest(
      "CAS analyst views a submitted SFO report",
      async ({ page, happoScreenshot }) => {
        const isExternalUser = false;
        const isLFO = false;
        // ── 1. Navigate to the past reports grid ──
        const grid = new CurrentReportsPOM(page);
        await grid.route();

        await grid.searchByOperationName(OPERATION_NAMES.BANGLES_SFO);

        // ── 2. Click "View Details" for the report — navigates to the 'Submitted' report view ──
        await grid.viewDetailsFromReportGrid(
          OPERATION_NAMES.BANGLES_SFO,
          isExternalUser,
        );
        const submittedReport = new AnnualReportPOM(page);

        await submittedReport.verifySubmittedReportView(
          OPERATION_NAMES.BANGLES_SFO,
          isLFO,
        );
        await takeStabilizedScreenshot(happoScreenshot, page, {
          component: "SFO Report - Submitted",
          variant: "internal",
        });
      },
    );
  },
);
