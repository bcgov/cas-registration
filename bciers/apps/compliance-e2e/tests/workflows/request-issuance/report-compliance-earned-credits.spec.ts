import { setupBeforeAllTest } from "@bciers/e2e/setupBeforeAll";
import { UserRole } from "@bciers/e2e/utils/enums";
import {
  ComplianceOperations,
  ComplianceDisplayStatus,
  GridActionText,
} from "@/compliance-e2e/utils/enums";
import { CurrentReportsPOM } from "@/reporting-e2e/poms/current-reports";
import { ComplianceSummariesPOM } from "@/compliance-e2e/poms/compliance-summaries";
import { ReviewComplianceEarnedCreditsPOM } from "@/compliance-e2e/poms/request-issuance/review-compliance-earned-credits";
import { RequestIssuanceTaskListPOM } from "@/compliance-e2e/poms/request-issuance/tasklist";

// 👤 run test using the storageState for role UserRole.INDUSTRY_USER_ADMIN
const test = setupBeforeAllTest(UserRole.INDUSTRY_USER_ADMIN);

test.describe.configure({ mode: "serial" });

test.describe("Test compliance report version request issuance of earned credits flow", () => {
  test("creates a compliance report version for an earned-credits report", async ({
    page,
  }) => {
    // Submit the report for "Earned credits"
    const gridReportingReports = new CurrentReportsPOM(page);
    await gridReportingReports.submitReportEarnedCredits();

    // Navigate to the compliance summaries grid
    const gridComplianceSummaries = new ComplianceSummariesPOM(page);
    await gridComplianceSummaries.route();

    // Assert the compliance report version record exists and has expected status
    await gridComplianceSummaries.assertStatusForOperation(
      ComplianceOperations.EARNED_CREDITS,
      ComplianceDisplayStatus.EARNED_CREDITS,
    );

    // Open the "Request Issuance" action for that operation
    await gridComplianceSummaries.openActionForOperation({
      operationName: ComplianceOperations.EARNED_CREDITS,
      linkName: GridActionText.REQUEST_ISSUANCE_CREDITS,
    });

    // Assert the record has an issuance status
    const reviewCompliance = new ReviewComplianceEarnedCreditsPOM(page);
    await reviewCompliance.assertIssuanceStatusValue("Issuance not requested");

    // From the Request Issuance task list, click "Request Issuance of Earned Credits"
    const taskListManageObligation = new RequestIssuanceTaskListPOM(page);
    await taskListManageObligation.clickRequestIssuance();
  });
});
