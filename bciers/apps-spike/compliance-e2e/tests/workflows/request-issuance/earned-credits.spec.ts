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

        // Click view action "Request Issuance of Credits"
        await industrySummaries.openActionForOperation({
          operationName: ComplianceOperations.EARNED_CREDITS,
          linkName: GridActionText.REQUEST_ISSUANCE_CREDITS,
        });

        // Click task list "Request Issuance of Earned Credits"
        await industryTaskList.clickRequestIssuance();

        // Submit "Request Issuance of Earned Credits"
        await industryEarnedCredits.submitRequestIssuance(request);

        // Route to compliance summaries
        await industrySummaries.route();

        // ✅ Assert status updated to "Earned credits - issuance requested"
        await industrySummaries.assertStatusForOperation(
          ComplianceOperations.EARNED_CREDITS,
          ComplianceDisplayStatus.EARNED_CREDITS_REQUESTED,
        );
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

        // Click view action "Review Credits Issuance Request"
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
      } finally {
        await analystPage.close();
      }

      // ----------------
      // Branch analyst suggestion != READY_TO_APPROVE
      // Industry user sees correct status
      // ----------------
      if (!isReadyToApproveCase(c)) {
        const industryPage2 = await openNewBrowserContextAs(
          UserRole.INDUSTRY_USER_ADMIN,
        );
        try {
          const industrySummaries2 = new ComplianceSummariesPOM(industryPage2);
          const expectedStatus =
            c.analystSuggestion ===
            AnalystSuggestion.REQUIRING_CHANGE_OF_BCCR_HOLDING_ACCOUNT_ID
              ? ComplianceDisplayStatus.EARNED_CREDITS_CHANGES_REQUIRED
              : ComplianceDisplayStatus.EARNED_CREDITS_DECLINED;

          // Route to compliance summaries
          await industrySummaries2.route();

          // ✅ Assert row status
          await industrySummaries2.assertStatusForOperation(
            ComplianceOperations.EARNED_CREDITS,
            expectedStatus,
          );
        } finally {
          await industryPage2.close();
        }

        return; // No director decision in this branch
      }

      // ----------------
      // Branch analyst suggestion == READY_TO_APPROVE
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

        // Route to compliance summaries
        await directorSummaries.route();

        // ✅ Assert row status "Earned credits - issuance requested"
        await directorSummaries.assertStatusForOperation(
          ComplianceOperations.EARNED_CREDITS,
          ComplianceDisplayStatus.EARNED_CREDITS_REQUESTED,
        );

        // Click view action "Review Credits Issuance Request"
        await directorSummaries.openActionForOperation({
          operationName: ComplianceOperations.EARNED_CREDITS,
          linkName: GridActionText.REVIEW_REQUEST_ISSUANCE,
        });

        // Submit director decision
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

        // Route to compliance summaries
        await directorSummaries.route();

        // ✅ Assert row status displays director decision
        await directorSummaries.assertStatusForOperation(
          ComplianceOperations.EARNED_CREDITS,
          c.expectedFinalStatus,
        );
      } finally {
        await directorPage.close();
      }
    });
  }

  test("Industry submits → Analyst(Requiring change of BCCR Holding Account ID)→ Industry re-submits →  Analyst(Ready to approve)", async ({
    request,
  }) => {
    // ----------------
    // 1) Industry submits issuance request
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

      // Click view action "Review Credits Issuance Request"
      await industrySummaries.openActionForOperation({
        operationName: ComplianceOperations.EARNED_CREDITS,
        linkName: GridActionText.REQUEST_ISSUANCE_CREDITS,
      });

      // Click task list "Request Issuance of Earned Credits"
      await industryTaskList.clickRequestIssuance();

      // Submit "Request Issuance of Earned Credits"
      await industryEarnedCredits.submitRequestIssuance(request);
    } finally {
      await industryPage.close();
    }

    // ----------------
    // 2) Analyst sets suggestion = REQUIRING_CHANGE_OF_BCCR_HOLDING_ACCOUNT_ID
    // ----------------
    const analystPage = await openNewBrowserContextAs(UserRole.CAS_ANALYST);
    try {
      const analystSummaries = new ComplianceSummariesPOM(analystPage);
      const analystEarnedCredits = new InternalReviewComplianceEarnedCreditsPOM(
        analystPage,
      );
      const analystTaskList = new InternalRequestIssuanceTaskListPOM(
        analystPage,
      );

      // Route to compliance summaries
      await analystSummaries.route();

      // Click view action "Review Credits Issuance Request"
      await analystSummaries.openActionForOperation({
        operationName: ComplianceOperations.EARNED_CREDITS,
        linkName: GridActionText.REVIEW_REQUEST_ISSUANCE,
      });

      // Click task list "Review Credits Issuance Request"
      await analystTaskList.clickReviewRequestIssuance();

      // Submit analyst suggestion- REQUIRING_CHANGE_OF_BCCR_HOLDING_ACCOUNT_ID
      await analystEarnedCredits.submitAnalystReviewRequestIssuance(
        AnalystSuggestion.REQUIRING_CHANGE_OF_BCCR_HOLDING_ACCOUNT_ID,
      );
    } finally {
      await analystPage.close();
    }

    // ----------------
    // 3) Industry re-submits issuance request
    // ----------------
    const industryPage2 = await openNewBrowserContextAs(
      UserRole.INDUSTRY_USER_ADMIN,
    );
    try {
      const industrySummaries2 = new ComplianceSummariesPOM(industryPage2);
      const industryEarnedCredits2 = new ReviewComplianceEarnedCreditsPOM(
        industryPage2,
      );

      // Route to compliance summaries
      await industrySummaries2.route();

      // Open "Review Change Required"
      await industrySummaries2.openActionForOperation({
        operationName: ComplianceOperations.EARNED_CREDITS,
        linkName: GridActionText.REVIEW_CHANGE_REQUIRED,
      });

      // Submit "Request Issuance of Earned Credits"
      await industryEarnedCredits2.submitRequestIssuance(request);
    } finally {
      await industryPage2.close();
    }

    // ----------------
    // 4) Analyst changes suggestion to READY_TO_APPROVE
    // ----------------
    const analystPage2 = await openNewBrowserContextAs(UserRole.CAS_ANALYST);
    try {
      const analystSummaries2 = new ComplianceSummariesPOM(analystPage2);
      const analystEarnedCredits2 =
        new InternalReviewComplianceEarnedCreditsPOM(analystPage2);
      const analystTaskList2 = new InternalRequestIssuanceTaskListPOM(
        analystPage2,
      );

      // Route to compliance summaries
      await analystSummaries2.route();

      // Click view action "Review Credits Issuance Request"
      await analystSummaries2.openActionForOperation({
        operationName: ComplianceOperations.EARNED_CREDITS,
        linkName: GridActionText.REVIEW_REQUEST_ISSUANCE,
      });

      // Click task list "Review Credits Issuance Request"
      await analystTaskList2.clickReviewRequestIssuance();

      // ✅ Analyst can change suggestion
      await analystEarnedCredits2.submitAnalystReviewRequestIssuance(
        AnalystSuggestion.READY_TO_APPROVE,
      );
    } finally {
      await analystPage2.close();
    }
  });
  test("Industry submits → Analyst(Ready to approve) → Analyst cannot change suggestion (backend errors)", async ({
    request,
  }) => {
    // ----------------
    // 1) Industry submits issuance request
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

      // Click view action "Review Credits Issuance Request"
      await industrySummaries.openActionForOperation({
        operationName: ComplianceOperations.EARNED_CREDITS,
        linkName: GridActionText.REQUEST_ISSUANCE_CREDITS,
      });

      // Click task list "Request Issuance of Earned Credits"
      await industryTaskList.clickRequestIssuance();

      // Submit "Request Issuance of Earned Credits"
      await industryEarnedCredits.submitRequestIssuance(request);
    } finally {
      await industryPage.close();
    }

    // ----------------
    // 2) Analyst sets suggestion = READY_TO_APPROVE
    // ----------------
    const analystPage = await openNewBrowserContextAs(UserRole.CAS_ANALYST);
    try {
      const analystSummaries = new ComplianceSummariesPOM(analystPage);
      const analystEarnedCredits = new InternalReviewComplianceEarnedCreditsPOM(
        analystPage,
      );
      const analystTaskList = new InternalRequestIssuanceTaskListPOM(
        analystPage,
      );

      // Route to compliance summaries
      await analystSummaries.route();

      // Click view action "Review Credits Issuance Request"
      await analystSummaries.openActionForOperation({
        operationName: ComplianceOperations.EARNED_CREDITS,
        linkName: GridActionText.REVIEW_REQUEST_ISSUANCE,
      });

      // Click task list "Review Credits Issuance Request"
      await analystTaskList.clickReviewRequestIssuance();

      // Submit analyst suggestion-"Ready to Approve"
      await analystEarnedCredits.submitAnalystReviewRequestIssuance(
        AnalystSuggestion.READY_TO_APPROVE,
      );
    } finally {
      await analystPage.close();
    }

    // ----------------
    // 3) Analyst tries to change suggestion after READY_TO_APPROVE → backend rejects
    // ----------------
    const analystPage2 = await openNewBrowserContextAs(UserRole.CAS_ANALYST);
    try {
      const analystSummaries2 = new ComplianceSummariesPOM(analystPage2);
      const analystEarnedCredits2 =
        new InternalReviewComplianceEarnedCreditsPOM(analystPage2);
      const analystTaskList2 = new InternalRequestIssuanceTaskListPOM(
        analystPage2,
      );

      // Route to compliance summaries
      await analystSummaries2.route();

      // Click view action "Review Credits Issuance Request"
      await analystSummaries2.openActionForOperation({
        operationName: ComplianceOperations.EARNED_CREDITS,
        linkName: GridActionText.REVIEW_REQUEST_ISSUANCE,
      });

      // Click task list "Review Credits Issuance Request"
      await analystTaskList2.clickReviewRequestIssuance();

      // UI allows selecting a different suggestion, but submit should fail server-side.
      await analystEarnedCredits2.submitAnalystReviewRequestIssuance(
        AnalystSuggestion.REQUIRING_CHANGE_OF_BCCR_HOLDING_ACCOUNT_ID,
        { expectSuccess: false },
      );
      //  ✅ Assert submit error dispays
      await analystEarnedCredits2.assertFinalSuggestionLockedError();
    } finally {
      await analystPage2.close();
    }
  });
});
