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

    test.describe(`${flowTitle}`, () => {
      test("Step 1: Industry user submits issuance request", async ({
        browser,
        request,
      }) => {
        const industryPage = await openNewBrowserContextAs(
          UserRole.INDUSTRY_USER_ADMIN,
          browser,
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
          await industrySummaries.route();
          await industrySummaries.assertStatusForOperation(
            ComplianceOperations.EARNED_CREDITS,
            ComplianceDisplayStatus.EARNED_CREDITS_REQUESTED,
          );
        } finally {
          await industryPage.close();
        }
      });

      test("Step 2: Analyst sets suggestion", async ({ browser }) => {
        const analystPage = await openNewBrowserContextAs(
          UserRole.CAS_ANALYST,
          browser,
        );
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
          await analystEarnedCredits.submitAnalystReviewRequestIssuance(
            c.analystSuggestion,
          );
        } finally {
          await analystPage.close();
        }
      });

      // Step 3 logic depends on the branch
      if (!isReadyToApproveCase(c)) {
        test("Step 3: Industry user sees correct status", async ({
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
        test("Step 3: Director decision", async ({ browser, request }) => {
          const directorPage = await openNewBrowserContextAs(
            UserRole.CAS_DIRECTOR,
            browser,
          );
          try {
            const summaries = new ComplianceSummariesPOM(directorPage);
            const internalEarnedCredits =
              new InternalReviewComplianceEarnedCreditsPOM(directorPage);
            const internalTaskList = new InternalRequestIssuanceTaskListPOM(
              directorPage,
            );

            await summaries.route();
            await summaries.openActionForOperation({
              operationName: ComplianceOperations.EARNED_CREDITS,
              linkName: GridActionText.REVIEW_REQUEST_ISSUANCE,
            });
            await internalTaskList.clickReviewByDirector();

            if (c.directorDecision === IssuanceStatus.APPROVED) {
              await internalEarnedCredits.approveIssuanceDirect(request);
            } else {
              await internalEarnedCredits.submitDirectorReviewIssuance(
                c.directorDecision,
              );
            }

            await summaries.route();
            await summaries.assertStatusForOperation(
              ComplianceOperations.EARNED_CREDITS,
              c.expectedFinalStatus,
            );
          } finally {
            await directorPage.close();
          }
        });
      }
    });
  }
});
