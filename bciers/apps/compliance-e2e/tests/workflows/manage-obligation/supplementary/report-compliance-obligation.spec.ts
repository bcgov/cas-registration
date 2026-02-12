import { setupBeforeAllTest } from "@bciers/e2e/setupBeforeAll";
import { UserRole } from "@bciers/e2e/utils/enums";
import {
  ComplianceOperations,
  ComplianceDisplayStatus,
} from "@/compliance-e2e/utils/enums";
import { CurrentReportsPOM } from "@/reporting-e2e/poms/current-reports";
import { ComplianceSummariesPOM } from "@/compliance-e2e/poms/compliance-summaries";
import { ReportsPOM } from "@/reporting-e2e/poms/reports";

// 👤 run test using the storageState for role UserRole.INDUSTRY_USER_ADMIN
const test = setupBeforeAllTest(UserRole.INDUSTRY_USER_ADMIN);

test.describe.configure({ mode: "serial" });
test.describe("Test supplementary compliance report version flow", () => {
  test("Submits supplementary obligation report and verifies void status of invoice", async ({
    page,
    request,
  }) => {
    // STEP 1:
    // Submit the initial report obligation
    const gridReportingReports = new CurrentReportsPOM(page);
    await gridReportingReports.submitReportObligation(false, request);

    // Assert the compliance report version record obligation not met exists
    const gridComplianceSummaries = new ComplianceSummariesPOM(page);
    await gridComplianceSummaries.route();
    await gridComplianceSummaries.assertStatusForOperation(
      ComplianceOperations.OBLIGATION_NOT_MET,
      ComplianceDisplayStatus.OBLIGATION_NOT_MET,
    );

    // STEP 2:
    // Submit the supplementary report that decreases and voids

    // Prime reporting-year DB state (open or closed) BEFORE any navigation that relies on it
    const reports = new ReportsPOM(page);
    await reports.primeReportingYear(true);

    const gridReportingReports2 = new CurrentReportsPOM(page);
    await gridReportingReports2.route();
    await gridReportingReports2.startSupplementaryReportById(3);

    // STEP 3:
  });
});
