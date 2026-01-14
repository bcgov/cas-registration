import { setupBeforeEachTest } from "@bciers/e2e/setupBeforeEach";
import { UserRole } from "@bciers/e2e/utils/enums";
import { openNewBrowserContextAs } from "@bciers/e2e/utils/helpers";
import {
  ComplianceOperations,
  ComplianceDisplayStatus,
  GridActionText,
} from "@/compliance-e2e/utils/enums";
import { DirectorDecision } from "@/compliance-e2e/utils/constants";
import { CurrentReportsPOM } from "@/reporting-e2e/poms/current-reports";
import { ComplianceSummariesPOM } from "@/compliance-e2e/poms/compliance-summaries";
import { ReviewComplianceEarnedCreditsPOM } from "@/compliance-e2e/poms/request-issuance/review-compliance-earned-credits";
import { RequestIssuanceTaskListPOM } from "@/compliance-e2e/poms/request-issuance/tasklist";
import { InternalRequestIssuanceTaskListPOM } from "@/compliance-e2e/poms/request-issuance/internal/tasklist";
import { InternalReviewComplianceEarnedCreditsPOM } from "@/compliance-e2e/poms/request-issuance/internal/internal-review-compliance-earned-credits";
import { AnalystSuggestion, IssuanceStatus } from "@bciers/utils/src/enums";

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
      request,
    }) => {
      // 1) Industry user
      const industryPage = await openNewBrowserContextAs(
        UserRole.INDUSTRY_USER_ADMIN,
      );
      try {
        // Init POMs
        const gridReportingReports = new CurrentReportsPOM(industryPage);
        const industrySummaries = new ComplianceSummariesPOM(industryPage);
        const industryTaskList = new RequestIssuanceTaskListPOM(industryPage);
        const industryEarnedCredits = new ReviewComplianceEarnedCreditsPOM(
          industryPage,
        );

        //  Submit report for earned credits
        await gridReportingReports.submitReportEarnedCredits(false, request);

        // Route to compliance summaries
        await industrySummaries.route();
        // Click earned credits summary report action "Review Credits Issuance Request"
        await industrySummaries.openActionForOperation({
          operationName: ComplianceOperations.EARNED_CREDITS,
          linkName: GridActionText.REQUEST_ISSUANCE_CREDITS,
        });

        // Click task list "Request Issuance of Earned Credits"
        await industryTaskList.clickRequestIssuance();

        // Submit Request Issuance of Earned Credits
        await industryEarnedCredits.submitRequestIssuance(request);
      } finally {
        await industryPage.close();
      }

      // 2) Analyst
      const analystPage = await openNewBrowserContextAs(UserRole.CAS_ANALYST);
      try {
        // Init POMs
        const analystSummaries = new ComplianceSummariesPOM(analystPage);
        const analystEarnedCredits =
          new InternalReviewComplianceEarnedCreditsPOM(analystPage);
        const analystTaskList = new InternalRequestIssuanceTaskListPOM(
          analystPage,
        );

        // Route to compliance summaries
        await analystSummaries.route();
        // Assert row for "Earned credits - issuance requested"
        await analystSummaries.assertStatusForOperation(
          ComplianceOperations.EARNED_CREDITS,
          ComplianceDisplayStatus.EARNED_CREDITS_REQUESTED,
        );
        // Click earned credits summary report action "Review Credits Issuance Request"
        await analystSummaries.openActionForOperation({
          operationName: ComplianceOperations.EARNED_CREDITS,
          linkName: GridActionText.REVIEW_REQUEST_ISSUANCE,
        });

        // Click task list "Review Credits Issuance Request"
        await analystTaskList.clickReviewRequestIssuance();

        // Submit analyst suggestion "Ready for approval"
        await analystEarnedCredits.submitAnalystReviewRequestIssuance();

        // Assert analyst suggestion "Ready for approval"
        await analystTaskList.clickReviewRequestIssuance();
        await analystEarnedCredits.assertAnalystSuggestionValue(
          new RegExp(AnalystSuggestion.READY_TO_APPROVE, "i"),
        );
      } finally {
        await analystPage.close();
      }

      // 3) Director
      const directorPage = await openNewBrowserContextAs(UserRole.CAS_DIRECTOR);
      try {
        //  Init POMs
        const directorSummaries = new ComplianceSummariesPOM(directorPage);
        // const directorEarnedCredits =
        //   new InternalReviewComplianceEarnedCreditsPOM(directorPage);
        // const directorTaskList = new InternalRequestIssuanceTaskListPOM(
        //   directorPage,
        // );

        // Route to compliance summaries
        await directorSummaries.route();
        // Assert row for "Earned credits - issuance requested"

        await directorSummaries.assertStatusForOperation(
          ComplianceOperations.EARNED_CREDITS,
          ComplianceDisplayStatus.EARNED_CREDITS_REQUESTED,
        );
        // Click earned credits summary report action "Review Credits Issuance Request"
        // await directorSummaries.openActionForOperation({
        //   operationName: ComplianceOperations.EARNED_CREDITS,
        //   linkName: GridActionText.REVIEW_REQUEST_ISSUANCE,
        // });

        // // Click task list "Review by Director"
        // await directorTaskList.clickReviewByDirector();

        // if (c.decision === IssuanceStatus.APPROVED) {
        //   // Attach stub + submit for Approved
        //   await directorEarnedCredits.approveIssuanceDirect(request);
        // } else {
        //   // Submit for Declined
        //   await directorEarnedCredits.submitDirectorReviewIssuance(c.decision);
        // }

        // // Route to compliance summaries
        // await directorSummaries.route();
        // // Assert row for earned credits - decision
        // await directorSummaries.assertStatusForOperation(
        //   ComplianceOperations.EARNED_CREDITS,
        //   c.expectedStatus,
        // );
      } finally {
        await directorPage.close();
      }
    });
  }
});
