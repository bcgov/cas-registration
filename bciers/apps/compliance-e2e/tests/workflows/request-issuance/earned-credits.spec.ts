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
    const flowTitle = isReadyToApproveCase(c)
      ? `Flow: Analyst(${c.analystSuggestion}) -> Director(${c.directorDecision})`
      : `Flow: Analyst(${c.analystSuggestion})`;

    test(`${flowTitle}`, async () => {
      test("Step 1: Industry user submits issuance request", async ({
        browser,
        request,
      }) => {
        const page = await openNewBrowserContextAs(
          UserRole.INDUSTRY_USER_ADMIN,
          browser,
        );
        try {
          const grid = new CurrentReportsPOM(page);
          const summaries = new ComplianceSummariesPOM(page);
          const taskList = new RequestIssuanceTaskListPOM(page);
          const earnedCredits = new ReviewComplianceEarnedCreditsPOM(page);

          await grid.submitReportEarnedCredits(false, request);
          await summaries.route();
          await summaries.openActionForOperation({
            operationName: ComplianceOperations.EARNED_CREDITS,
            linkName: GridActionText.REQUEST_ISSUANCE_CREDITS,
          });
          await taskList.clickRequestIssuance();
          await earnedCredits.submitRequestIssuance(request);
          await summaries.route();
          await summaries.assertStatusForOperation(
            ComplianceOperations.EARNED_CREDITS,
            ComplianceDisplayStatus.EARNED_CREDITS_REQUESTED,
          );
        } finally {
          await page.close();
        }
      });

      test("Step 2: Analyst sets suggestion", async ({ browser }) => {
        const page = await openNewBrowserContextAs(
          UserRole.CAS_ANALYST,
          browser,
        );
        try {
          const summaries = new ComplianceSummariesPOM(page);
          const earnedCredits = new InternalReviewComplianceEarnedCreditsPOM(
            page,
          );
          const taskList = new InternalRequestIssuanceTaskListPOM(page);

          await summaries.route();
          await summaries.assertStatusForOperation(
            ComplianceOperations.EARNED_CREDITS,
            ComplianceDisplayStatus.EARNED_CREDITS_REQUESTED,
          );
          await summaries.openActionForOperation({
            operationName: ComplianceOperations.EARNED_CREDITS,
            linkName: GridActionText.REVIEW_REQUEST_ISSUANCE,
          });
          await taskList.clickReviewRequestIssuance();
          await earnedCredits.submitAnalystReviewRequestIssuance(
            c.analystSuggestion,
          );
        } finally {
          await page.close();
        }
      });

      if (!isReadyToApproveCase(c)) {
        test("Step 3: Industry user sees correct Change Required/Declined status", async ({
          browser,
        }) => {
          const page = await openNewBrowserContextAs(
            UserRole.INDUSTRY_USER_ADMIN,
            browser,
          );
          try {
            const summaries = new ComplianceSummariesPOM(page);
            const expectedStatus =
              c.analystSuggestion ===
              AnalystSuggestion.REQUIRING_CHANGE_OF_BCCR_HOLDING_ACCOUNT_ID
                ? ComplianceDisplayStatus.EARNED_CREDITS_CHANGES_REQUIRED
                : ComplianceDisplayStatus.EARNED_CREDITS_DECLINED;

            await summaries.route();
            await summaries.assertStatusForOperation(
              ComplianceOperations.EARNED_CREDITS,
              expectedStatus,
            );
          } finally {
            await page.close();
          }
        });
      } else {
        test("Step 3: Director approves/declines", async ({
          browser,
          request,
        }) => {
          const page = await openNewBrowserContextAs(
            UserRole.CAS_DIRECTOR,
            browser,
          );
          try {
            const summaries = new ComplianceSummariesPOM(page);
            const earnedCredits = new InternalReviewComplianceEarnedCreditsPOM(
              page,
            );
            const taskList = new InternalRequestIssuanceTaskListPOM(page);

            await summaries.route();
            await summaries.assertStatusForOperation(
              ComplianceOperations.EARNED_CREDITS,
              ComplianceDisplayStatus.EARNED_CREDITS_REQUESTED,
            );
            await summaries.openActionForOperation({
              operationName: ComplianceOperations.EARNED_CREDITS,
              linkName: GridActionText.REVIEW_REQUEST_ISSUANCE,
            });
            await taskList.clickReviewByDirector();
            await earnedCredits.assertDirectorDecisionButtonsVisible(true);

            if (c.directorDecision === IssuanceStatus.APPROVED) {
              await earnedCredits.approveIssuanceDirect(request);
            } else {
              await earnedCredits.submitDirectorReviewIssuance(
                c.directorDecision,
              );
            }

            await summaries.route();
            await summaries.assertStatusForOperation(
              ComplianceOperations.EARNED_CREDITS,
              c.expectedFinalStatus,
            );
          } finally {
            await page.close();
          }
        });
      }
    });
  }

  test.describe("Scenario: Industry re-submits after Change Required", () => {
    test("Step 1: Initial Industry Submission", async ({
      browser,
      request,
    }) => {
      const page = await openNewBrowserContextAs(
        UserRole.INDUSTRY_USER_ADMIN,
        browser,
      );
      try {
        const grid = new CurrentReportsPOM(page);
        const summaries = new ComplianceSummariesPOM(page);
        const taskList = new RequestIssuanceTaskListPOM(page);
        const earned = new ReviewComplianceEarnedCreditsPOM(page);

        await grid.submitReportEarnedCredits(false, request);
        await summaries.route();
        await summaries.openActionForOperation({
          operationName: ComplianceOperations.EARNED_CREDITS,
          linkName: GridActionText.REQUEST_ISSUANCE_CREDITS,
        });
        await taskList.clickRequestIssuance();
        await earned.submitRequestIssuance(request);
      } finally {
        await page.close();
      }
    });

    test("Step 2: Analyst Requests Change", async ({ browser }) => {
      const page = await openNewBrowserContextAs(UserRole.CAS_ANALYST, browser);
      try {
        const summaries = new ComplianceSummariesPOM(page);
        const earned = new InternalReviewComplianceEarnedCreditsPOM(page);
        const taskList = new InternalRequestIssuanceTaskListPOM(page);

        await summaries.route();
        await summaries.openActionForOperation({
          operationName: ComplianceOperations.EARNED_CREDITS,
          linkName: GridActionText.REVIEW_REQUEST_ISSUANCE,
        });
        await taskList.clickReviewRequestIssuance();
        await earned.submitAnalystReviewRequestIssuance(
          AnalystSuggestion.REQUIRING_CHANGE_OF_BCCR_HOLDING_ACCOUNT_ID,
        );
      } finally {
        await page.close();
      }
    });

    test("Step 3: Industry Re-submits", async ({ browser, request }) => {
      const page = await openNewBrowserContextAs(
        UserRole.INDUSTRY_USER_ADMIN,
        browser,
      );
      try {
        const summaries = new ComplianceSummariesPOM(page);
        const earned = new ReviewComplianceEarnedCreditsPOM(page);
        await summaries.route();
        await summaries.openActionForOperation({
          operationName: ComplianceOperations.EARNED_CREDITS,
          linkName: GridActionText.REVIEW_CHANGE_REQUIRED,
        });
        await earned.submitRequestIssuance(request);
      } finally {
        await page.close();
      }
    });

    test("Step 4: Analyst Final Suggestion (Ready to Approve)", async ({
      browser,
    }) => {
      const page = await openNewBrowserContextAs(UserRole.CAS_ANALYST, browser);
      try {
        const summaries = new ComplianceSummariesPOM(page);
        const earned = new InternalReviewComplianceEarnedCreditsPOM(page);
        const taskList = new InternalRequestIssuanceTaskListPOM(page);
        await summaries.route();
        await summaries.openActionForOperation({
          operationName: ComplianceOperations.EARNED_CREDITS,
          linkName: GridActionText.REVIEW_REQUEST_ISSUANCE,
        });
        await taskList.clickReviewRequestIssuance();
        await earned.submitAnalystReviewRequestIssuance(
          AnalystSuggestion.READY_TO_APPROVE,
        );
      } finally {
        await page.close();
      }
    });
  });

  test.describe("Scenario: Analyst Final Suggestion Immutability", () => {
    test("Step 1: Analyst sets Ready to Approve", async ({
      browser,
      request,
    }) => {
      // Industry submits
      const industryPage = await openNewBrowserContextAs(
        UserRole.INDUSTRY_USER_ADMIN,
        browser,
      );
      try {
        const grid = new CurrentReportsPOM(industryPage);
        await grid.submitReportEarnedCredits(false, request);
      } finally {
        await industryPage.close();
      }

      // Analyst sets suggestion
      const analystPage = await openNewBrowserContextAs(
        UserRole.CAS_ANALYST,
        browser,
      );
      try {
        const summaries = new ComplianceSummariesPOM(analystPage);
        const earned = new InternalReviewComplianceEarnedCreditsPOM(
          analystPage,
        );
        const taskList = new InternalRequestIssuanceTaskListPOM(analystPage);
        await summaries.route();
        await summaries.openActionForOperation({
          operationName: ComplianceOperations.EARNED_CREDITS,
          linkName: GridActionText.REVIEW_REQUEST_ISSUANCE,
        });
        await taskList.clickReviewRequestIssuance();
        await earned.submitAnalystReviewRequestIssuance(
          AnalystSuggestion.READY_TO_APPROVE,
        );
      } finally {
        await analystPage.close();
      }
    });

    test("Step 2: Analyst cannot change suggestion (Backend Lock)", async ({
      browser,
    }) => {
      const page = await openNewBrowserContextAs(UserRole.CAS_ANALYST, browser);
      try {
        const summaries = new ComplianceSummariesPOM(page);
        const earned = new InternalReviewComplianceEarnedCreditsPOM(page);
        const taskList = new InternalRequestIssuanceTaskListPOM(page);

        await summaries.route();
        await summaries.openActionForOperation({
          operationName: ComplianceOperations.EARNED_CREDITS,
          linkName: GridActionText.REVIEW_REQUEST_ISSUANCE,
        });
        await taskList.clickReviewRequestIssuance();
        await earned.submitAnalystReviewRequestIssuance(
          AnalystSuggestion.REQUIRING_CHANGE_OF_BCCR_HOLDING_ACCOUNT_ID,
          { expectSuccess: false },
        );
        await earned.assertFinalSuggestionLockedError();
      } finally {
        await page.close();
      }
    });
  });
});
