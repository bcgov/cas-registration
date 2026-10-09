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

test.describe("GGEAPAR interest flow - CAS analyst", () => {
  const complianceReportVersionId = OVERDUE_PENALTY_CRV_ID;
  const daysOverdue = DEFAULT_DAYS_OVERDUE;
  const targetAccrualDate = "2026-12-15"; // Date that populates grid records

  test("when the report is not supplementary, selecting GGEAPAR shows the not-applicable alert", async ({
    page,
    request,
    happoScreenshot,
  }) => {
    // Prime DB state via e2e integration stub
    const penaltyCalculator = new PenaltyCalculatorPOM(page);
    await penaltyCalculator.setupAccruingPenaltyState(
      request,
      complianceReportVersionId,
      {
        days_overdue: daysOverdue,
        penalty_status: PenaltyStatus.ACCRUING,
      },
    );

    // Navigate to Compliance Summaries grid and drill into the obligation
    const summaries = new ComplianceSummariesPOM(page);
    await summaries.route();
    await summaries.openActionForOperation({
      operationName: ComplianceDisplayStatus.OBLIGATION_NOT_MET,
      linkName: GridActionText.VIEW_DETAILS,
      urlPattern: REVIEW_OBLIGATION_URL_PATTERN,
    });

    // Open the penalty calculator from the task list
    const manageObligationTaskList = new ManageObligationTaskListPOM(page);
    await manageObligationTaskList.clickPenaltyCalculator();
    await penaltyCalculator.assertUrlCorrect(complianceReportVersionId);

    // Alert is absent for the default Automatic overdue type
    await penaltyCalculator.assertGgeaparNotApplicableHidden();

    // Switch to GGEAPAR and verify the alert
    await penaltyCalculator.selectGgeaparPenaltyType();
    await penaltyCalculator.assertGgeaparNotApplicable();

    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "Penalty calculator",
      variant: "GGEAPAR - not applicable (non-supplementary report)",
    });
  });

  test("when a supplementary report was submitted late, GGEAPAR interest accrues and renders daily calculations", async ({
    page,
    request,
    happoScreenshot,
  }) => {
    // Prime DB state: supplementary report submitted after the deadline
    const penaltyCalculator = new PenaltyCalculatorPOM(page);
    await penaltyCalculator.setupSupplementaryLateSubmissionState(
      request,
      complianceReportVersionId,
      {
        days_overdue: daysOverdue,
        penalty_status: PenaltyStatus.ACCRUING,
      },
    );

    // Navigate to the penalty calculator
    const summaries = new ComplianceSummariesPOM(page);
    await summaries.route();
    await summaries.openActionForOperation({
      operationName: ComplianceDisplayStatus.OBLIGATION_NOT_MET,
      linkName: GridActionText.VIEW_DETAILS,
      urlPattern: REVIEW_OBLIGATION_URL_PATTERN,
    });
    const manageObligationTaskList = new ManageObligationTaskListPOM(page);
    await manageObligationTaskList.clickPenaltyCalculator();
    await penaltyCalculator.assertUrlCorrect(complianceReportVersionId);

    // Switch to GGEAPAR: interest applies, so no not-applicable alert
    await penaltyCalculator.selectGgeaparPenaltyType();
    await penaltyCalculator.assertGgeaparNotApplicableHidden();

    // Select a final accrual date and verify the grid is populated
    await penaltyCalculator.setFinalAccrualDate(targetAccrualDate);
    await penaltyCalculator.assertPenaltyGridLoaded();
    await penaltyCalculator.assertGgeaparNotApplicableHidden();

    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "Penalty calculator",
      variant: `GGEAPAR - accruing (supplementary, ${daysOverdue} days overdue)`,
    });
  });
});
