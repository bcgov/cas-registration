import { setupBeforeAllTest } from "@bciers/e2e/setupBeforeAll";
import { UserRole } from "@bciers/e2e/utils/enums";
import { newContextForRole } from "@bciers/e2e/utils/helpers";
import {
  ComplianceOperations,
  ComplianceDisplayStatus,
  GridActionText,
} from "@/compliance-e2e/utils/enums";

import { BCCR_HOLDING_ACCOUNT_INPUT_VALUE } from "@/compliance-e2e/utils/constants";

import { CurrentReportsPOM } from "@/reporting-e2e/poms/current-reports";
import { ComplianceSummariesPOM } from "@/compliance-e2e/poms/compliance-summaries";
import { ReviewComplianceEarnedCreditsPOM } from "@/compliance-e2e/poms/request-issuance/review-compliance-earned-credits";
import { RequestIssuanceTaskListPOM } from "@/compliance-e2e/poms/request-issuance/tasklist";
import { InternalRequestIssuanceTaskListPOM } from "@/compliance-e2e/poms/request-issuance/internal/tasklist";
import { InternalReviewComplianceEarnedCreditsPOM } from "@/compliance-e2e/poms/request-issuance/internal/internal-review-compliance-earned-credits";

// Seed environment
const test = setupBeforeAllTest(UserRole.INDUSTRY_USER_ADMIN);

test.describe.configure({ mode: "serial" });

test.describe("Test earned credits approve request issuance flow", () => {
  test("Industry submits request issuance → analyst sets as ready for approval → director approves", async ({
    browser,
    baseURL,
    request,
  }) => {
    // Wrapper to call helper newContextForRole for role switching
    const createContextForRole = (role: UserRole) =>
      newContextForRole(browser, baseURL, role);

    // 1. Industry user context
    // Submit report for earned credits then request issuance of earned credits

    // Create role context
    const industryContext = await createContextForRole(
      UserRole.INDUSTRY_USER_ADMIN,
    );
    // Init POMS
    const industryPage = await industryContext.newPage();
    const industryReports = new CurrentReportsPOM(industryPage);
    const industrySummaries = new ComplianceSummariesPOM(industryPage);
    const industryTaskList = new RequestIssuanceTaskListPOM(industryPage);
    const industryEarnedCredits = new ReviewComplianceEarnedCreditsPOM(
      industryPage,
    );

    // 🔌 Attach stub to mock the call to API: getBccrAccountDetails
    await industryEarnedCredits.attachBccrAccountValidationStub(
      "Mock Trading Name Inc.",
    );
    // 🔌 Attach stub to mock the call to API for industry earned-credits
    await industryEarnedCredits.attachRequestIssuanceStub(request);

    // Submit report version
    await industryReports.submitReportEarnedCredits();

    // Open compliance report version
    await industrySummaries.route();
    await industrySummaries.openActionForOperation({
      operationName: ComplianceOperations.EARNED_CREDITS,
      linkName: GridActionText.REQUEST_ISSUANCE_CREDITS,
    });

    // Navigate to request issuance
    await industryTaskList.clickRequestIssuance();

    // Submit request issuance of earned credits
    await industryEarnedCredits.fillRequestIssuanceForm(
      BCCR_HOLDING_ACCOUNT_INPUT_VALUE,
    );
    await industryEarnedCredits.submitRequestIssuance();
    await industryContext.close();

    // 2. CAS_ANALYST context
    // Review request issuance of earned credits and set as "Ready to Approve"

    // Create role context
    const analystContext = await createContextForRole(UserRole.CAS_ANALYST);

    // Init POMS
    const analystPage = await analystContext.newPage();
    const analystSummaries = new ComplianceSummariesPOM(analystPage);
    const analystEarnedCredits = new InternalReviewComplianceEarnedCreditsPOM(
      analystPage,
    );

    // Open compliance report version
    await analystSummaries.route();
    await analystSummaries.assertStatusForOperation(
      ComplianceOperations.EARNED_CREDITS,
      ComplianceDisplayStatus.EARNED_CREDITS_REQUESTED,
    );
    await analystSummaries.openActionForOperation({
      operationName: ComplianceOperations.EARNED_CREDITS,
      linkName: GridActionText.REVIEW_REQUEST_ISSUANCE,
    });

    // Navigate to review request issuance
    const analystTaskList = new InternalRequestIssuanceTaskListPOM(analystPage);
    await analystTaskList.clickReviewRequestIssuance();

    // Submit ready for approval for request issuance of earned credits
    await analystEarnedCredits.submitAnalystReviewRequestIssuance();
    await analystContext.close();

    // 3. CAS_DIRECTOR context
    // Review "Ready to Approve" request issuance of earned credits and set as "Approved"

    // Create role context
    const directorContext = await createContextForRole(UserRole.CAS_DIRECTOR);

    // Init POMS
    const directorPage = await directorContext.newPage();
    const directorSummaries = new ComplianceSummariesPOM(directorPage);
    const directorEarnedCredits = new InternalReviewComplianceEarnedCreditsPOM(
      directorPage,
    );
    // 🔌 Attach stub to mock the call to API for director earned-credits
    await directorEarnedCredits.attachDirectorReviewStub(request);

    // Open compliance report version
    await directorSummaries.route();
    await directorSummaries.assertStatusForOperation(
      ComplianceOperations.EARNED_CREDITS,
      ComplianceDisplayStatus.EARNED_CREDITS_REQUESTED,
    );
    await directorSummaries.openActionForOperation({
      operationName: ComplianceOperations.EARNED_CREDITS,
      linkName: GridActionText.REVIEW_REQUEST_ISSUANCE,
    });

    // Navigate to review by director
    const directorTaskList = new InternalRequestIssuanceTaskListPOM(
      directorPage,
    );
    await directorTaskList.clickReviewByDirector();

    // Submit approved request issuance of earned credits
    await directorEarnedCredits.submitDirectorReviewIssuance();

    await directorSummaries.route();
    await directorSummaries.assertStatusForOperation(
      ComplianceOperations.EARNED_CREDITS,
      ComplianceDisplayStatus.EARNED_CREDITS_APPROVED,
    );
  });
});
