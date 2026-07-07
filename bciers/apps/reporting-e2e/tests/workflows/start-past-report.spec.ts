import { PastReportsPOM } from "@/reporting-e2e/poms/past-reports";
import { StartPastReportPOM } from "@/reporting-e2e/poms/start-past-report";
import { ReportOperationPOM } from "@/reporting-e2e/poms/report-operation";
import { REGULATED_OPERATION_REGISTRATION_PURPOSE } from "@reporting/src/app/utils/constants";
import { OPERATION_NAMES } from "@/reporting-e2e/utils/enums";
import { setupBeforeAllTest } from "@bciers/e2e/setupBeforeAll";
import { UserRole } from "@bciers/e2e/utils/enums";

const test = setupBeforeAllTest(UserRole.INDUSTRY_USER_ADMIN);
test.describe.configure({ mode: "serial" });

test.describe("Start Past Report", () => {
  test("Industry user can start a report for a previous reporting year", async ({
    page,
  }) => {
    //  Setup POMs
    const pastReports = new PastReportsPOM(page);
    const startPastReport = new StartPastReportPOM(page);
    const reportOperation = new ReportOperationPOM(page);

    // Navigate to the past reports grid
    await pastReports.route();

    // Click button File previous years report
    await pastReports.clickFileReport();

    // Assert Report on a previous year page displays
    await startPastReport.isLoaded();

    // Complete form
    await startPastReport.selectReportingYear("2024");
    await startPastReport.selectOperation(OPERATION_NAMES.BUGLE_SFO);
    await startPastReport.selectRegistrationPurpose(
      REGULATED_OPERATION_REGISTRATION_PURPOSE,
    );
    //  Submit form
    await startPastReport.clickStart();

    // Assert Review Operation Information page displays
    await reportOperation.isLoaded();
  });
});
