import { setupBeforeEachTest } from "@bciers/e2e/setupBeforeEach";
import { UserRole } from "@bciers/e2e/utils/enums";
import { openNewBrowserContextAs } from "@bciers/e2e/utils/helpers";
import {
  ComplianceOperations,
  ComplianceDisplayStatus,
  GridActionText,
} from "@/compliance-e2e/utils/enums";
import {
  DirectorDecision,
  REQUEST_ISSUANCE_CREDITS_URL_PATTERN,
} from "@/compliance-e2e/utils/constants";
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

/**
 * READY_TO_APPROVE => director can approve/decline
 * REQUIRING_*      => should map to issuance_status === CHANGES_REQUIRED
 */
type ReadyToApproveCase = {
  analystSuggestion: AnalystSuggestion.READY_TO_APPROVE;
  directorDecision: DirectorDecision;
  expectedFinalStatus: ComplianceDisplayStatus;
};

type ChangeRequiredCase = {
  analystSuggestion:
    | AnalystSuggestion.REQUIRING_CHANGE_OF_BCCR_HOLDING_ACCOUNT_ID
    | AnalystSuggestion.REQUIRING_SUPPLEMENTARY_REPORT;
};

type FlowCase = ReadyToApproveCase | ChangeRequiredCase;

function isReadyToApproveCase(c: FlowCase): c is ReadyToApproveCase {
  return c.analystSuggestion === AnalystSuggestion.READY_TO_APPROVE;
}

const FLOW_CASES: FlowCase[] = [
  {
    analystSuggestion: AnalystSuggestion.READY_TO_APPROVE,
    directorDecision: IssuanceStatus.APPROVED,
    expectedFinalStatus: ComplianceDisplayStatus.EARNED_CREDITS_APPROVED,
  },
  {
    analystSuggestion: AnalystSuggestion.READY_TO_APPROVE,
    directorDecision: IssuanceStatus.DECLINED,
    expectedFinalStatus: ComplianceDisplayStatus.EARNED_CREDITS_DECLINED,
  },
  {
    analystSuggestion:
      AnalystSuggestion.REQUIRING_CHANGE_OF_BCCR_HOLDING_ACCOUNT_ID,
  },
  {
    analystSuggestion: AnalystSuggestion.REQUIRING_SUPPLEMENTARY_REPORT,
  },
];

test.describe("Test earned credits request issuance flow", () => {
  test.slow();

  for (const c of FLOW_CASES) {
    const title = isReadyToApproveCase(c)
      ? `Industry submits → Analyst(${String(c.analystSuggestion)}) → Director(${String(c.directorDecision)})`
      : `Industry submits → Analyst(${String(c.analystSuggestion)})`;

    // eslint-disable-next-line playwright/valid-title
    test(String(title), async ({ request }) => {
      // ----------------
      // 1) Industry user submits issuance request
      // ----------------
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

        // Submit report for earned credits
        await gridReportingReports.submitReportEarnedCredits(false, request);

        // Route to compliance summaries
        await industrySummaries.route();

        // Click action "Request Issuance of Credits"
        await industrySummaries.openActionForOperation({
          operationName: ComplianceOperations.EARNED_CREDITS,
          linkName: GridActionText.REQUEST_ISSUANCE_CREDITS,
        });

        // Click task list "Request Issuance of Earned Credits"
        await industryTaskList.clickRequestIssuance();

        // Submit Request Issuance of Earned Credits
        await industryEarnedCredits.submitRequestIssuance(request);

        // Route to compliance summaries
        await industrySummaries.route();

        // ✅ Assert status updated
        await industrySummaries.assertStatusForOperation(
          ComplianceOperations.EARNED_CREDITS,
          ComplianceDisplayStatus.EARNED_CREDITS_REQUESTED,
        );

        // Click action "Request Issuance of Credits"
        await industrySummaries.openActionForOperation({
          operationName: ComplianceOperations.EARNED_CREDITS,
          linkName: GridActionText.VIEW_DETAILS,
        });

        // ❌ Assert NO "Request Issuance of Credits" button
        await industryEarnedCredits.assertRequestIssuanceButtonVisible(false);
      } finally {
        await industryPage.close();
      }

      // ----------------
      // 2) Analyst sets suggestion
      // ----------------
      const analystPage = await openNewBrowserContextAs(UserRole.CAS_ANALYST);
      try {
        const analystSummaries = new ComplianceSummariesPOM(analystPage);
        const analystEarnedCredits =
          new InternalReviewComplianceEarnedCreditsPOM(analystPage);
        const analystTaskList = new InternalRequestIssuanceTaskListPOM(
          analystPage,
        );

        await analystSummaries.route();

        // ✅ Assert row status
        await analystSummaries.assertStatusForOperation(
          ComplianceOperations.EARNED_CREDITS,
          ComplianceDisplayStatus.EARNED_CREDITS_REQUESTED,
        );

        // Open action "Review Credits Issuance Request"
        await analystSummaries.openActionForOperation({
          operationName: ComplianceOperations.EARNED_CREDITS,
          linkName: GridActionText.REVIEW_REQUEST_ISSUANCE,
        });

        // Click task list "Review Credits Issuance Request"
        await analystTaskList.clickReviewRequestIssuance();

        // Submit analyst suggestion
        await analystEarnedCredits.submitAnalystReviewRequestIssuance(
          c.analystSuggestion,
        );

        // ❌ Assert NO Approve\Decline buttons
        await analystEarnedCredits.assertDirectorDecisionButtonsVisible(false);

        // ✅ Assert analyst suggestion persisted
        await analystTaskList.clickReviewRequestIssuance();
        await analystEarnedCredits.assertAnalystSuggestionValue(
          new RegExp(c.analystSuggestion, "i"),
        );
      } finally {
        await analystPage.close();
      }

      // ----------------
      // Branch Suggestion != READY_TO_APPROVE
      // Industry user sees correct issuance status
      // ----------------
      if (!isReadyToApproveCase(c)) {
        const industryPage2 = await openNewBrowserContextAs(
          UserRole.INDUSTRY_USER_ADMIN,
        );
        try {
          const industrySummaries2 = new ComplianceSummariesPOM(industryPage2);

          await industrySummaries2.route();

          await industrySummaries2.openActionForOperation({
            operationName: ComplianceOperations.EARNED_CREDITS,
            linkName: GridActionText.REVIEW_CHANGE_REQUIRED,
            urlPattern: REQUEST_ISSUANCE_CREDITS_URL_PATTERN,
          });
        } finally {
          await industryPage2.close();
        }

        return; // No director decision in this branch
      }

      // ----------------
      // Branch Suggestion == READY_TO_APPROVE
      // Director approves/declines
      // ----------------
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

        await directorTaskList.clickReviewByDirector();

        // ✅ Assert Approve\Decline buttons
        await directorEarnedCredits.assertDirectorDecisionButtonsVisible(true);

        // Submit director decision
        if (c.directorDecision === IssuanceStatus.APPROVED) {
          // Attach stub + submit for Approved
          await directorEarnedCredits.approveIssuanceDirect(request);
        } else {
          await directorEarnedCredits.submitDirectorReviewIssuance(
            c.directorDecision,
          );
        }

        await directorSummaries.route();

        // ✅ Assert row status is director decision
        await directorSummaries.assertStatusForOperation(
          ComplianceOperations.EARNED_CREDITS,
          c.expectedFinalStatus,
        );
      } finally {
        await directorPage.close();
      }
    });
  }
});
