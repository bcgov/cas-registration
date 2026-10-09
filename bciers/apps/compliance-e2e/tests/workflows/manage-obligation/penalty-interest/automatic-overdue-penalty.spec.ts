import { setupBeforeEachTest } from "@bciers/e2e/setupBeforeEach";
import { UserRole } from "@bciers/e2e/utils/enums";
import { takeStabilizedScreenshot } from "@bciers/e2e/utils/helpers";
import {
  ComplianceDisplayStatus,
  PenaltyStatus,
  GridActionText,
} from "@/compliance-e2e/utils/enums";
import {
  DEFAULT_DAYS_OVERDUE,
  OVERDUE_PENALTY_CRV_ID,
  REVIEW_OBLIGATION_URL_PATTERN,
} from "@/compliance-e2e/utils/constants";
import { ComplianceSummariesPOM } from "@/compliance-e2e/poms/compliance-summaries";
import { ManageObligationTaskListPOM } from "@/compliance-e2e/poms/manage-obligation/tasklist";
import { PenaltyCalculatorPOM } from "@/compliance-e2e/poms/manage-obligation/penalty-calculator";

// 👤 Setup scoped test runners per role
const internalTest = setupBeforeEachTest(UserRole.CAS_ANALYST);
const externalTest = setupBeforeEachTest(UserRole.INDUSTRY_USER_ADMIN);

const complianceReportVersionId = OVERDUE_PENALTY_CRV_ID;
const daysOverdue = DEFAULT_DAYS_OVERDUE;
const targetAccrualDate = "2026-12-15";

// ---------------------------------------------------------------------------
// Internal Suite (CAS Analyst)
// ---------------------------------------------------------------------------
internalTest.describe("Automatic overdue penalty flow - CAS analyst", () => {
  internalTest(
    "when obligation is overdue, obligation renders daily penalty calculations",
    async ({ page, request, happoScreenshot }) => {
      // 1. Prime DB state via e2e integration stub for CRV 2
      const penaltyCalculator = new PenaltyCalculatorPOM(page);
      await penaltyCalculator.setupAccruingPenaltyState(
        request,
        complianceReportVersionId,
        {
          days_overdue: daysOverdue,
          penalty_status: PenaltyStatus.ACCRUING,
        },
      );

      // Navigate to Compliance Summaries grid
      const summaries = new ComplianceSummariesPOM(page);
      await summaries.route();

      // Verify row with 'Obligation - not met' displays 'ACCRUING' penalty status
      await summaries.assertPenaltyStatusForOperation(
        ComplianceDisplayStatus.OBLIGATION_NOT_MET,
        PenaltyStatus.ACCRUING,
      );

      // Drill down via "View Details" on the 'ACCRUING', 'Obligation - not met' row
      await summaries.openActionForOperation({
        operationName: ComplianceDisplayStatus.OBLIGATION_NOT_MET,
        linkName: GridActionText.VIEW_DETAILS,
        urlPattern: REVIEW_OBLIGATION_URL_PATTERN,
        penaltyStatus: PenaltyStatus.ACCRUING,
      });

      // Click "Penalty calculator" from the task list
      const manageObligationTaskList = new ManageObligationTaskListPOM(page);
      await manageObligationTaskList.clickPenaltyCalculator();

      // Verify URL route
      await penaltyCalculator.assertUrlCorrect(complianceReportVersionId);

      // Select an overdue date to populate calculation rows in the grid
      await penaltyCalculator.setFinalAccrualDate(targetAccrualDate);

      // Verify grid is populated with records
      await penaltyCalculator.assertPenaltyGridLoaded();

      await takeStabilizedScreenshot(happoScreenshot, page, {
        component: "Penalty calculator",
        variant: `status: ${PenaltyStatus.ACCRUING} - ${daysOverdue} days overdue`,
      });
    },
  );
});

// ---------------------------------------------------------------------------
// External Suite (Industry User Admin)
// ---------------------------------------------------------------------------
externalTest.describe("Automatic overdue penalty flow - Industry user", () => {
  externalTest(
    "when navigating directly to the penalty calculator, the page is not found",
    async ({ page }) => {
      // The penalty calculator only exists for internal users, so it is never linked in the industry task list.
      // Guard against it being reachable by URL instead.
      const penaltyCalculator = new PenaltyCalculatorPOM(page);
      await penaltyCalculator.route(complianceReportVersionId);

      await penaltyCalculator.assertNotFound();
    },
  );
});
