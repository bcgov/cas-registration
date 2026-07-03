import { setupBeforeAllTest } from "@bciers/e2e/setupBeforeAll";
import { UserRole } from "@bciers/e2e/utils/enums";
import { OPERATION_NAMES } from "@/reporting-e2e/utils/enums";
import { takeStabilizedScreenshot } from "@bciers/e2e/utils/helpers";
import { SubmittedPOM } from "@/reporting-e2e/poms/submitted";
import { AnnualReportPOM } from "@/reporting-e2e/poms/annual-report";
import { ReportHistoryPOM } from "@/reporting-e2e/poms/report-history";
import { ReportOperationPOM } from "@/reporting-e2e/poms/report-operation";

const test = setupBeforeAllTest(UserRole.INDUSTRY_USER_ADMIN);
const internalTest = setupBeforeAllTest(UserRole.CAS_ANALYST);
const reportVersion = 10;

test.describe.configure({ mode: "serial" });

test.describe("View Report History", () => {
  test("Industry user views the report history for a submitted report", async ({
    page,
    happoScreenshot,
  }) => {
    const grid = new ReportHistoryPOM(page);
    // Navigate directly to the report history page for id reportVersion

    await grid.route(reportVersion);
    await grid.validatePageElements(OPERATION_NAMES.BANANA_LFO);

    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "Report History Grid",
      variant: "external",
    });

    // Click "View Details" for the report history — navigates to the 'Submitted' report view for the selected version
    await grid.viewDetailsFromReportHistory(1);
    const reportDetails = new SubmittedPOM(page);
    await reportDetails.verifySubmittedReportView(
      OPERATION_NAMES.BANANA_LFO,
      true,
    );

    await grid.route(reportVersion); // Navigate back to the report history page

    // Click "Continue" for the report history — navigates to the 'Review Operation Information' page for the selected version
    await grid.continueReportFromHistory(12); // Continue from the draft report from the Report History page
    const operationInformation = new ReportOperationPOM(page);
    await operationInformation.verifyFieldVisibility();
  });
});

internalTest.describe("View Report History", () => {
  internalTest(
    "CAS analyst views the report history for a submitted report",
    async ({ page, happoScreenshot }) => {
      const grid = new ReportHistoryPOM(page);
      await grid.route(reportVersion); // Navigate directly to the report history page for id reportVersion

      await takeStabilizedScreenshot(happoScreenshot, page, {
        component: "Report History Grid",
        variant: "internal",
      });

      await grid.viewDetailsFromReportHistory(1);
      const reportDetails = new AnnualReportPOM(page);
      await reportDetails.verifySubmittedReportView(
        OPERATION_NAMES.BANANA_LFO,
        true,
      );

      // Internal user can't see the in-progress version, so we don't test the "Continue" button
    },
  );
});
