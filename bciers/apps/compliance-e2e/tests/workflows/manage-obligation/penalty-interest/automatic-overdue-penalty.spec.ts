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

// 👤 run test using the storageState for internal staff (CAS Analyst)
const test = setupBeforeEachTest(UserRole.CAS_ANALYST);

test.describe("Automatic overdue penalty flow - CAS analyst", () => {
  const complianceReportVersionId = OVERDUE_PENALTY_CRV_ID;
  const daysOverdue = DEFAULT_DAYS_OVERDUE;
  const targetAccrualDate = "2026-12-15"; // Overdue date that populates grid records

  test("when obligation is overdue, displays ACCRUING status on summaries and renders daily penalty calculations", async ({
    page,
    request,
    happoScreenshot,
  }) => {
    // Prime DB state via e2e integration stub for CRV 2
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

    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "Compliance summaries grid",
      variant: `penalty status: ${PenaltyStatus.ACCRUING}`,
    });

    // Drill down via "View Details" on the 'Obligation - not met' row
    await summaries.openActionForOperation({
      operationName: ComplianceDisplayStatus.OBLIGATION_NOT_MET,
      linkName: GridActionText.VIEW_DETAILS,
      urlPattern: REVIEW_OBLIGATION_URL_PATTERN,
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
  });
});
