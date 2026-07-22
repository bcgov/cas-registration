import { setupBeforeAllTest } from "@bciers/e2e/setupBeforeAll";
import { UserRole } from "@bciers/e2e/utils/enums";
import {
  setupTestEnvironment,
  takeStabilizedScreenshot,
} from "@bciers/e2e/utils/helpers";
import {
  ComplianceOperations,
  ComplianceDisplayStatus,
  GridActionText,
} from "@/compliance-e2e/utils/enums";
import {
  DirectorDecision,
  TRACK_ISSUANCE_URL_PATTERN,
} from "@/compliance-e2e/utils/constants";
import { CurrentReportsPOM } from "@/reporting-e2e/poms/current-reports";
import { ComplianceSummariesPOM } from "@/compliance-e2e/poms/compliance-summaries";
import { ReviewComplianceEarnedCreditsPOM } from "@/compliance-e2e/poms/request-issuance/review-compliance-earned-credits";
import { RequestIssuanceTaskListPOM } from "@/compliance-e2e/poms/request-issuance/tasklist";
import { InternalRequestIssuanceTaskListPOM } from "@/compliance-e2e/poms/request-issuance/internal/tasklist";
import { InternalReviewComplianceEarnedCreditsPOM } from "@/compliance-e2e/poms/request-issuance/internal/internal-review-compliance-earned-credits";
import { TrackStatusOfIssuancePOM } from "@/compliance-e2e/poms/request-issuance/track-status-of-issuance";
import { AnalystSuggestion, IssuanceStatus } from "@bciers/utils/src/enums";

// Seed environment once; each flow case re-seeds via its own beforeAll
const test = setupBeforeAllTest(UserRole.INDUSTRY_USER_ADMIN);

// Role-specific test fixtures — each inherits happo via setupBeforeAllTest
// so happoScreenshot works correctly on the fixture page for that role.
const analystTest = setupBeforeAllTest(UserRole.CAS_ANALYST);
const directorTest = setupBeforeAllTest(UserRole.CAS_DIRECTOR);

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

  for (const [caseIndex, c] of FLOW_CASES.entries()) {
    // eslint-disable-next-line playwright/valid-title
    const title = isReadyToApproveCase(c)
      ? `Industry submits → Analyst(${String(c.analystSuggestion)}) → Director(${String(c.directorDecision)})`
      : `Industry submits → Analyst(${String(c.analystSuggestion)})`;

    test.describe(title, () => {
      test.describe.configure({ mode: "serial" });

      // Fresh DB state before each flow case
      test.beforeAll(async () => {
        await setupTestEnvironment();
      });

      // ── Step 1: Industry submits issuance request ────────────────────────
      test("1) Industry submits issuance request", async ({
        page,
        request,
        happoScreenshot,
      }) => {
        const gridReportingReports = new CurrentReportsPOM(page);
        const industrySummaries = new ComplianceSummariesPOM(page);
        const industryTaskList = new RequestIssuanceTaskListPOM(page);
        const industryEarnedCredits = new ReviewComplianceEarnedCreditsPOM(
          page,
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

        // Wait for form to be ready (the submit button appears once data has loaded)
        await industryEarnedCredits.assertFormReady();

        // happo screenshot - earned credits request form (same across all cases, taken once)
        if (caseIndex === 0) {
          await takeStabilizedScreenshot(happoScreenshot, page, {
            component: "Compliance earned credits - request issuance",
            variant: "Industry - request issuance form",
          });
        }

        // Submit "Request Issuance of Earned Credits"
        await industryEarnedCredits.submitRequestIssuance(request);

        // Route to compliance summaries
        await industrySummaries.route();

        // ✅ Assert status updated to "Earned credits - issuance requested"
        await industrySummaries.assertStatusForOperation(
          ComplianceOperations.EARNED_CREDITS,
          ComplianceDisplayStatus.EARNED_CREDITS_REQUESTED,
        );

        // happo screenshot - compliance summaries "issuance requested" (same across all cases, taken once)
        if (caseIndex === 0) {
          await takeStabilizedScreenshot(happoScreenshot, page, {
            component: "Compliance earned credits - request issuance",
            variant: "Industry - compliance summaries: issuance requested",
          });
        }
      });

      // ── Step 2: Analyst sets suggestion ─────────────────────────────────
      // Uses analystTest so the fixture page is authenticated as the analyst
      // and happoScreenshot works correctly on that page.
      analystTest(
        "2) Analyst sets suggestion",
        async ({ page, happoScreenshot }) => {
          const analystSummaries = new ComplianceSummariesPOM(page);
          const analystEarnedCredits =
            new InternalReviewComplianceEarnedCreditsPOM(page);
          const analystTaskList = new InternalRequestIssuanceTaskListPOM(page);

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

          if (caseIndex === 0) {
            await analystEarnedCredits.selectAnalystSuggestion(
              c.analystSuggestion,
            );
            await takeStabilizedScreenshot(happoScreenshot, page, {
              component: "Compliance earned credits - analyst review",
              variant: "Analyst - review request issuance form",
            });
          }

          // Submit analyst suggestion (also fills in the analyst comment)
          await analystEarnedCredits.submitAnalystReviewRequestIssuance(
            c.analystSuggestion,
          );
        },
      );

      // ── Step 3a: Non-READY_TO_APPROVE — industry sees changed status ─────
      if (!isReadyToApproveCase(c)) {
        test("3) Industry sees changed status", async ({
          page,
          happoScreenshot,
        }) => {
          const expectedStatus =
            c.analystSuggestion ===
            AnalystSuggestion.REQUIRING_CHANGE_OF_BCCR_HOLDING_ACCOUNT_ID
              ? ComplianceDisplayStatus.EARNED_CREDITS_CHANGES_REQUIRED
              : ComplianceDisplayStatus.EARNED_CREDITS_DECLINED;

          const industrySummaries = new ComplianceSummariesPOM(page);
          await industrySummaries.route();

          // ✅ Assert row status
          await industrySummaries.assertStatusForOperation(
            ComplianceOperations.EARNED_CREDITS,
            expectedStatus,
          );

          // happo screenshot - compliance summaries after analyst decision
          await takeStabilizedScreenshot(happoScreenshot, page, {
            component: "Compliance earned credits - request issuance",
            variant: `Industry - compliance summaries after analyst decision: ${title}`,
          });
        });

        // ── Step 3b & 4: READY_TO_APPROVE — director decides, industry verifies
      } else {
        directorTest(
          "3) Director approves/declines",
          async ({ page, request, happoScreenshot }) => {
            const directorSummaries = new ComplianceSummariesPOM(page);
            const directorEarnedCredits =
              new InternalReviewComplianceEarnedCreditsPOM(page);
            const directorTaskList = new InternalRequestIssuanceTaskListPOM(
              page,
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

            // Click task list "Review by Director"
            await directorTaskList.clickReviewByDirector();

            // ✅ Assert Approve\Decline buttons
            await directorEarnedCredits.assertDirectorDecisionButtonsVisible(
              true,
            );

            // happo screenshot - director review page with approve/decline buttons
            // Taken once (APPROVED case); the page looks identical for DECLINED.
            if (c.directorDecision === IssuanceStatus.APPROVED) {
              await takeStabilizedScreenshot(happoScreenshot, page, {
                component: "Compliance earned credits - director review",
                variant: "Director - review with approve and decline buttons",
              });
            }

            // Submit director decision
            if (c.directorDecision === IssuanceStatus.APPROVED) {
              // Stub fires directly (no browser nav); manually route to track-status
              await directorEarnedCredits.approveIssuanceDirect(request);
              await directorEarnedCredits.routeToTrackStatus();
            } else {
              // Button click navigates to track-status on success (waitForUrl inside)
              await directorEarnedCredits.submitDirectorReviewIssuance(
                c.directorDecision,
              );
            }

            // Wait for form data to load before taking the screenshot
            await directorEarnedCredits.assertTrackStatusLoaded();

            await takeStabilizedScreenshot(happoScreenshot, page, {
              component: "Compliance earned credits - director review",
              variant: `Director - after ${String(c.directorDecision)}`,
            });
          },
        );

        test("4) Industry verifies final status", async ({
          page,
          happoScreenshot,
        }) => {
          const industrySummaries = new ComplianceSummariesPOM(page);
          await industrySummaries.route();

          // ✅ Assert row status reflects director decision
          await industrySummaries.assertStatusForOperation(
            ComplianceOperations.EARNED_CREDITS,
            c.expectedFinalStatus,
          );

          // happo screenshot - compliance summaries with final director decision status
          await takeStabilizedScreenshot(happoScreenshot, page, {
            component: "Compliance earned credits - request issuance",
            variant: `Director decision - industry compliance summaries: ${title}`,
          });

          // For the declined case, also open industry's own Track Status of
          // Issuance detail page (not just the grid badge)
          if (c.directorDecision === IssuanceStatus.DECLINED) {
            await industrySummaries.openActionForOperation({
              operationName: ComplianceOperations.EARNED_CREDITS,
              linkName: GridActionText.VIEW_DETAILS,
              urlPattern: TRACK_ISSUANCE_URL_PATTERN,
            });

            const trackStatusOfIssuance = new TrackStatusOfIssuancePOM(page);
            await trackStatusOfIssuance.assertShowsDeclinedNote();

            // happo screenshot - industry-facing declined issuance detail page
            await takeStabilizedScreenshot(happoScreenshot, page, {
              component: "Compliance earned credits - request issuance",
              variant: "Industry - track status of issuance (declined)",
            });
          }
        });
      }
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Re-submit flow
  // ─────────────────────────────────────────────────────────────────────────
  test.describe("Industry submits → Analyst(Requiring change of BCCR Holding Account ID) → Industry re-submits → Analyst(Ready to approve)", () => {
    test.describe.configure({ mode: "serial" });

    test.beforeAll(async () => {
      await setupTestEnvironment();
    });

    test("1) Industry submits issuance request", async ({ page, request }) => {
      const gridReportingReports = new CurrentReportsPOM(page);
      const industrySummaries = new ComplianceSummariesPOM(page);
      const industryTaskList = new RequestIssuanceTaskListPOM(page);
      const industryEarnedCredits = new ReviewComplianceEarnedCreditsPOM(page);

      await gridReportingReports.submitReportEarnedCredits(false, request);
      await industrySummaries.route();
      await industrySummaries.openActionForOperation({
        operationName: ComplianceOperations.EARNED_CREDITS,
        linkName: GridActionText.REQUEST_ISSUANCE_CREDITS,
      });
      await industryTaskList.clickRequestIssuance();
      await industryEarnedCredits.submitRequestIssuance(request);
    });

    analystTest(
      "2) Analyst sets REQUIRING_CHANGE_OF_BCCR_HOLDING_ACCOUNT_ID",
      async ({ page }) => {
        const analystSummaries = new ComplianceSummariesPOM(page);
        const analystEarnedCredits =
          new InternalReviewComplianceEarnedCreditsPOM(page);
        const analystTaskList = new InternalRequestIssuanceTaskListPOM(page);

        await analystSummaries.route();
        await analystSummaries.openActionForOperation({
          operationName: ComplianceOperations.EARNED_CREDITS,
          linkName: GridActionText.REVIEW_REQUEST_ISSUANCE,
        });
        await analystTaskList.clickReviewRequestIssuance();
        await analystEarnedCredits.submitAnalystReviewRequestIssuance(
          AnalystSuggestion.REQUIRING_CHANGE_OF_BCCR_HOLDING_ACCOUNT_ID,
        );
      },
    );

    test("3) Industry re-submits issuance request", async ({
      page,
      request,
      happoScreenshot,
    }) => {
      const industrySummaries = new ComplianceSummariesPOM(page);
      const industryEarnedCredits = new ReviewComplianceEarnedCreditsPOM(page);

      await industrySummaries.route();

      // Open "Review Change Required"
      await industrySummaries.openActionForOperation({
        operationName: ComplianceOperations.EARNED_CREDITS,
        linkName: GridActionText.REVIEW_CHANGE_REQUIRED,
      });

      // Wait for the form to be ready before taking the screenshot
      await industryEarnedCredits.assertFormReady();

      // happo screenshot - earned credits re-submit form after change required
      await takeStabilizedScreenshot(happoScreenshot, page, {
        component: "Compliance earned credits - request issuance",
        variant: "Industry - re-submit after change required",
      });

      await industryEarnedCredits.submitRequestIssuance(request);
    });

    analystTest(
      "4) Analyst changes suggestion to READY_TO_APPROVE",
      async ({ page }) => {
        const analystSummaries = new ComplianceSummariesPOM(page);
        const analystEarnedCredits =
          new InternalReviewComplianceEarnedCreditsPOM(page);
        const analystTaskList = new InternalRequestIssuanceTaskListPOM(page);

        await analystSummaries.route();
        await analystSummaries.openActionForOperation({
          operationName: ComplianceOperations.EARNED_CREDITS,
          linkName: GridActionText.REVIEW_REQUEST_ISSUANCE,
        });
        await analystTaskList.clickReviewRequestIssuance();

        // ✅ Analyst can change suggestion
        await analystEarnedCredits.submitAnalystReviewRequestIssuance(
          AnalystSuggestion.READY_TO_APPROVE,
        );
      },
    );
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Locked suggestion flow
  // ─────────────────────────────────────────────────────────────────────────
  test.describe("Industry submits → Analyst(Ready to approve) → Analyst cannot change suggestion (backend errors)", () => {
    test.describe.configure({ mode: "serial" });

    test.beforeAll(async () => {
      await setupTestEnvironment();
    });

    test("1) Industry submits issuance request", async ({ page, request }) => {
      const gridReportingReports = new CurrentReportsPOM(page);
      const industrySummaries = new ComplianceSummariesPOM(page);
      const industryTaskList = new RequestIssuanceTaskListPOM(page);
      const industryEarnedCredits = new ReviewComplianceEarnedCreditsPOM(page);

      await gridReportingReports.submitReportEarnedCredits(false, request);
      await industrySummaries.route();
      await industrySummaries.openActionForOperation({
        operationName: ComplianceOperations.EARNED_CREDITS,
        linkName: GridActionText.REQUEST_ISSUANCE_CREDITS,
      });
      await industryTaskList.clickRequestIssuance();
      await industryEarnedCredits.submitRequestIssuance(request);
    });

    analystTest(
      "2) Analyst sets READY_TO_APPROVE (suggestion gets locked after submit)",
      async ({ page }) => {
        const analystSummaries = new ComplianceSummariesPOM(page);
        const analystEarnedCredits =
          new InternalReviewComplianceEarnedCreditsPOM(page);
        const analystTaskList = new InternalRequestIssuanceTaskListPOM(page);

        await analystSummaries.route();
        await analystSummaries.openActionForOperation({
          operationName: ComplianceOperations.EARNED_CREDITS,
          linkName: GridActionText.REVIEW_REQUEST_ISSUANCE,
        });
        await analystTaskList.clickReviewRequestIssuance();

        await analystEarnedCredits.submitAnalystReviewRequestIssuance(
          AnalystSuggestion.READY_TO_APPROVE,
        );
      },
    );
  });
});
