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
import { IssuanceStatus } from "@bciers/utils/src/enums";
import { takeStabilizedScreenshot } from "@bciers/e2e/utils/helpers";

// 👤 run test using the storageState for role UserRole.INDUSTRY_USER_ADMIN
const test = setupBeforeAllTest(UserRole.INDUSTRY_USER_ADMIN);

test.describe.configure({ mode: "serial" });

test.describe("Test report version to compliance report version earned credits flow", () => {
  test("Submits an Earned Credits report and verifies status in Compliance Summary grid", async ({
    page,
    request,
    happoScreenshot,
  }) => {
    // Submit the report for "Earned credits"
    const gridReportingReports = new CurrentReportsPOM(page);
    await gridReportingReports.submitReportEarnedCredits(false, request);
    // Navigate to the compliance summaries grid
    const gridComplianceSummaries = new ComplianceSummariesPOM(page);
    await gridComplianceSummaries.route();

    // Assert the compliance report version record exists and has expected status
    await gridComplianceSummaries.assertStatusForOperation(
      ComplianceOperations.EARNED_CREDITS,
      ComplianceDisplayStatus.EARNED_CREDITS_NOT_REQUESTED,
    );

    // Open the "Request Issuance" action for that operation
    await gridComplianceSummaries.openActionForOperation({
      operationName: ComplianceOperations.EARNED_CREDITS,
      linkName: GridActionText.REQUEST_ISSUANCE_CREDITS,
    });

    // Assert the record has the correct issuance status
    const earnedCredits = new ReviewComplianceEarnedCreditsPOM(page);
    await earnedCredits.assertIssuanceStatusValue(
      IssuanceStatus.ISSUANCE_NOT_REQUESTED,
    );

    // happo screenshot
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "Compliance earned credits",
      variant: "default",
    });
  });
});
