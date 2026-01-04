import { setupBeforeEachTest } from "@bciers/e2e/setupBeforeEach";

import { UserRole } from "@bciers/e2e/utils/enums";
import {
  newContextForRole,
  takeStabilizedScreenshot,
} from "@bciers/e2e/utils/helpers";
import {
  ComplianceOperations,
  ComplianceDisplayStatus,
  GridActionText,
} from "@/compliance-e2e/utils/enums";

import {
  BCCR_HOLDING_ACCOUNT_INPUT_VALUE,
  DirectorDecision,
} from "@/compliance-e2e/utils/constants";

import { CurrentReportsPOM } from "@/reporting-e2e/poms/current-reports";
import { ComplianceSummariesPOM } from "@/compliance-e2e/poms/compliance-summaries";
import { ReviewComplianceEarnedCreditsPOM } from "@/compliance-e2e/poms/request-issuance/review-compliance-earned-credits";
import { RequestIssuanceTaskListPOM } from "@/compliance-e2e/poms/request-issuance/tasklist";
import { InternalRequestIssuanceTaskListPOM } from "@/compliance-e2e/poms/request-issuance/internal/tasklist";
import { InternalReviewComplianceEarnedCreditsPOM } from "@/compliance-e2e/poms/request-issuance/internal/internal-review-compliance-earned-credits";
import { IssuanceStatus } from "@bciers/utils/src/enums";

// Seed environment
const test = setupBeforeEachTest(UserRole.INDUSTRY_USER_ADMIN);

test.describe.configure({ mode: "serial" });

const CASES: Array<{
  decision: DirectorDecision;
  expectedStatus: ComplianceDisplayStatus;
}> = [
  {
    decision: IssuanceStatus.APPROVED,
    expectedStatus: ComplianceDisplayStatus.EARNED_CREDITS_APPROVED,
  },
  {
    decision: IssuanceStatus.DECLINED,
    expectedStatus: ComplianceDisplayStatus.EARNED_CREDITS_DECLINED,
  },
];

test.describe("Test earned credits request issuance flow", () => {
  for (const c of CASES) {
    test(`Industry submits request issuance → analyst sets as ready for approval → director ${c.decision}`, async ({
      browser,
      baseURL,
      request,
      happoScreenshot,
    }) => {
      // Wrapper to call helper newContextForRole for role switching
      const createContextForRole = (role: UserRole) =>
        newContextForRole(browser, baseURL, role);

      // 1. Industry user context: Submit report for earned credits then request issuance of earned credits

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

      // 2. CAS_ANALYST context: Review request issuance of earned credits and set as "Ready to Approve"

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
      const analystTaskList = new InternalRequestIssuanceTaskListPOM(
        analystPage,
      );
      await analystTaskList.clickReviewRequestIssuance();

      await takeStabilizedScreenshot(happoScreenshot, analystPage, {
        component: "Earned credits request issuance",
        variant: `analyst-review-page`,
      });

      // Submit ready for approval for request issuance of earned credits
      await analystEarnedCredits.submitAnalystReviewRequestIssuance();
      await analystContext.close();

      // 3. CAS_DIRECTOR context: Review "Ready to Approve" request issuance of earned credits and set as "Approved"

      // Create role context
      const directorContext = await createContextForRole(UserRole.CAS_DIRECTOR);

      // Init POMS
      const directorPage = await directorContext.newPage();
      const directorSummaries = new ComplianceSummariesPOM(directorPage);
      const directorEarnedCredits =
        new InternalReviewComplianceEarnedCreditsPOM(directorPage);
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

      await takeStabilizedScreenshot(happoScreenshot, directorPage, {
        component: "Earned credits request issuance",
        variant: `director-review-page-${c.decision.toLowerCase()}`,
      });

      // Submit director decision of request issuance of earned credits
      await directorEarnedCredits.submitDirectorReviewIssuance(c.decision);

      await directorSummaries.route();
      await directorSummaries.assertStatusForOperation(
        ComplianceOperations.EARNED_CREDITS,
        c.expectedStatus,
      );

      await takeStabilizedScreenshot(happoScreenshot, directorPage, {
        component: "Earned credits request issuance",
        variant: `final-status-${c.decision.toLowerCase()}`,
      });

      await directorContext.close();
    });
  }
});
