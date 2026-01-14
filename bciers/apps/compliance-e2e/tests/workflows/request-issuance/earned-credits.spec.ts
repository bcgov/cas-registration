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
      // 1. Industry user: Submit report for earned credits then request issuance of earned credits

      const industryPage = await openNewBrowserContextAs(
        UserRole.INDUSTRY_USER_ADMIN,
      );
      try {
        const gridReportingReports = new CurrentReportsPOM(industryPage);
        const industrySummaries = new ComplianceSummariesPOM(industryPage);
        const industryTaskList = new RequestIssuanceTaskListPOM(industryPage);
        const industryEarnedCredits = new ReviewComplianceEarnedCreditsPOM(
          industryPage,
        );

        await gridReportingReports.submitReportEarnedCredits(false, request);

        await industrySummaries.route();
        await industrySummaries.openActionForOperation({
          operationName: ComplianceOperations.EARNED_CREDITS,
          linkName: GridActionText.REQUEST_ISSUANCE_CREDITS,
        });

        await industryTaskList.clickRequestIssuance();
        await industryEarnedCredits.submitRequestIssuance(request);
      } finally {
        await industryPage.close();
      }

      // 2. CAS_ANALYST context: Review request issuance of earned credits and set as "Ready to Approve"

      const analystPage = await openNewBrowserContextAs(UserRole.CAS_ANALYST);
      try {
        const analystSummaries = new ComplianceSummariesPOM(analystPage);
        const analystEarnedCredits =
          new InternalReviewComplianceEarnedCreditsPOM(analystPage);
        const analystTaskList = new InternalRequestIssuanceTaskListPOM(
          analystPage,
        );

        await analystSummaries.route();
        await analystSummaries.assertStatusForOperation(
          ComplianceOperations.EARNED_CREDITS,
          ComplianceDisplayStatus.EARNED_CREDITS_REQUESTED,
        );

        await analystSummaries.openActionForOperation({
          operationName: ComplianceOperations.EARNED_CREDITS,
          linkName: GridActionText.REVIEW_REQUEST_ISSUANCE,
        });

        await analystTaskList.clickReviewRequestIssuance();
        await analystEarnedCredits.submitAnalystReviewRequestIssuance();
      } finally {
        await analystPage.close();
      }

      // 3. CAS_DIRECTOR context: Review "Ready to Approve" request issuance of earned credits and make decision

      const directorPage = await openNewBrowserContextAs(UserRole.CAS_DIRECTOR);
      try {
        const directorSummaries = new ComplianceSummariesPOM(directorPage);
        const directorEarnedCredits =
          new InternalReviewComplianceEarnedCreditsPOM(directorPage);
        const directorTaskList = new InternalRequestIssuanceTaskListPOM(
          directorPage,
        );

        await directorSummaries.route();

        await directorSummaries.assertStatusForOperation(
          ComplianceOperations.EARNED_CREDITS,
          ComplianceDisplayStatus.EARNED_CREDITS_REQUESTED,
        );
        await directorSummaries.openActionForOperation({
          operationName: ComplianceOperations.EARNED_CREDITS,
          linkName: GridActionText.REVIEW_REQUEST_ISSUANCE,
        });

        await directorTaskList.clickReviewRequestIssuance();

        await directorEarnedCredits.assertAnalystSuggestionValue(
          new RegExp(AnalystSuggestion.READY_TO_APPROVE, "i"),
        );

        await directorTaskList.clickReviewByDirector();

        if (c.decision === IssuanceStatus.APPROVED) {
          // 🔌 Attach stub API, prevents external API calls
          await directorEarnedCredits.approveIssuanceDirect(request);
        } else {
          // Continue with submit server action
          await directorEarnedCredits.submitDirectorReviewIssuance(c.decision);
        }

        await directorSummaries.route();
        await directorSummaries.assertStatusForOperation(
          ComplianceOperations.EARNED_CREDITS,
          c.expectedStatus,
        );
      } finally {
        await directorPage.close();
      }
    });
  }
});
