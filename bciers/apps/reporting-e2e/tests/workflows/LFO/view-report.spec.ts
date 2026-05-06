import { setupBeforeAllTest } from "@bciers/e2e/setupBeforeAll";
import { UserRole } from "@bciers/e2e/utils/enums";
import { OPERATION_NAMES } from "@/reporting-e2e/utils/enums";
import { CurrentReportsPOM } from "@/reporting-e2e/poms/current-reports";
import { takeStabilizedScreenshot } from "@bciers/e2e/utils/helpers";

const test = setupBeforeAllTest(UserRole.INDUSTRY_USER_ADMIN);
const internalTest = setupBeforeAllTest(UserRole.CAS_ANALYST);

test.describe.configure({ mode: "serial" });

test.describe("LFO: view a submitted report for the current reporting year", () => {
  test("Industry user views a submitted LFO report", async ({
    page,
    happoScreenshot,
  }) => {
    // ── 1. Navigate to the past reports grid ──
    const grid = new CurrentReportsPOM(page);
    await grid.route();

    await grid.searchByOperationName(OPERATION_NAMES.BANGLES_SFO);

    // ── 2. Click "View Details" for the report — navigates to the 'Submitted' report view ──
    await grid.viewDetailsForReport(OPERATION_NAMES.BANGLES_SFO, true);

    await grid.verifySubmittedReportView(OPERATION_NAMES.BANGLES_SFO);
    // - 3. Click the "Save as PDF" button and verify the 'Print' dialog opens
    await grid.verifySaveAsPDF();
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "LFO Report - Submitted",
      variant: "Industry user views submitted report",
    });
  });
});

internalTest.describe(
  "LFO: view a submitted report for the current reporting year",
  () => {
    internalTest(
      "CAS analyst views a submitted LFO report",
      async ({ page, happoScreenshot }) => {
        // ── 1. Navigate to the past reports grid ──
        const grid = new CurrentReportsPOM(page);
        await grid.route();

        await grid.searchByOperationName(OPERATION_NAMES.BANGLES_SFO);

        // ── 2. Click "View Details" for the report — navigates to the 'Submitted' report view ──
        await grid.viewDetailsForReport(OPERATION_NAMES.BANGLES_SFO, false);

        await grid.verifySubmittedReportView(OPERATION_NAMES.BANGLES_SFO);
        // - 3. Click the "Save as PDF" button and verify the 'Print' dialog opens
        await grid.verifySaveAsPDF();
        await takeStabilizedScreenshot(happoScreenshot, page, {
          component: "LFO Report - Submitted",
          variant: "CAS analyst views submitted report",
        });
      },
    );
  },
);
