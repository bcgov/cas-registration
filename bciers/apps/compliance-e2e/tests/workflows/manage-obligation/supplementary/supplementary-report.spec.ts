import { setupBeforeAllTest } from "@bciers/e2e/setupBeforeAll";
import { UserRole } from "@bciers/e2e/utils/enums";
import {
  ComplianceOperations,
  ComplianceDisplayStatus,
} from "@/compliance-e2e/utils/enums";
import { CurrentReportsPOM } from "@/reporting-e2e/poms/current-reports";
import { ComplianceSummariesPOM } from "@/compliance-e2e/poms/compliance-summaries";
import { takeStabilizedScreenshot } from "@bciers/e2e/utils/helpers";

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
    const gridReportingReports2 = new CurrentReportsPOM(page);
    await gridReportingReports2.primeReportingYear(request, true);
    await gridReportingReports2.route();
    await gridReportingReports2.submitSupplementaryReportObligation(false, request);
  });
});
