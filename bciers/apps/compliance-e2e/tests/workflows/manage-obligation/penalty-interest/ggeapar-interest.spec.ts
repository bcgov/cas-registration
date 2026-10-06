import { setupBeforeEachTest } from "@bciers/e2e/setupBeforeEach";
import { UserRole } from "@bciers/e2e/utils/enums";
import { takeStabilizedScreenshot } from "@bciers/e2e/utils/helpers";
import {
  ComplianceOperations,
  PenaltyStatus,
  GridActionText,
} from "@/compliance-e2e/utils/enums";
import { REVIEW_OBLIGATION_URL_PATTERN } from "@/compliance-e2e/utils/constants";
import { ComplianceSummariesPOM } from "@/compliance-e2e/poms/compliance-summaries";
import { ManageObligationTaskListPOM } from "@/compliance-e2e/poms/manage-obligation/tasklist";
import { PenaltyCalculatorPOM } from "@/compliance-e2e/poms/manage-obligation/penalty-calculator";

// 👤 run test using the storageState for role UserRole.CAS_ANALYST
const test = setupBeforeEachTest(UserRole.CAS_ANALYST);

test.describe("Automatic overdue penalty flow - CAS analyst", () => {
  const complianceReportVersionId = 123;
  const daysOverdue = 45;

  test("when obligation is overdue, displays ACCRUING status on compliance summaries and renders daily penalty calculations", async ({
    page,
    request,
    happoScreenshot,
  }) => {
    // PRECONDITIONS:
    // Prime DB state via e2e stub with 45 days overdue penalty
    const penaltyCalculator = new PenaltyCalculatorPOM(page);
    await penaltyCalculator.setupAccruingPenaltyState(
      request,
      complianceReportVersionId,
      {
        days_overdue: daysOverdue,
        penalty_status: PenaltyStatus.ACCRUING,
      },
    );

    // After stub POST, navigate to the compliance summaries grid
    const summaries = new ComplianceSummariesPOM(page);
    await summaries.route();

    // Assert the grid row displays the ACCRUING penalty status
    await summaries.assertPenaltyStatusForOperation(
      ComplianceOperations.OBLIGATION_NOT_MET,
      PenaltyStatus.ACCRUING,
    );

    // happo screenshot
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "Compliance summaries grid",
      variant: `penalty status: ${PenaltyStatus.ACCRUING}`,
    });

    // Drill down from summaries row to the review obligation page
    await summaries.openActionForOperation({
      operationName: ComplianceOperations.OBLIGATION_NOT_MET,
      linkName: GridActionText.VIEW_DETAILS,
      urlPattern: REVIEW_OBLIGATION_URL_PATTERN,
    });

    // Click the "Penalty calculator" item from the task list
    const manageObligationTaskList = new ManageObligationTaskListPOM(page);
    await manageObligationTaskList.clickPenaltyCalculator();

    // Assert calculator route and loaded grid
    await penaltyCalculator.assertUrlCorrect(complianceReportVersionId);
    await penaltyCalculator.assertPenaltyGridLoaded(PenaltyStatus.ACCRUING);

    // happo screenshot
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "Penalty calculator",
      variant: `status: ${PenaltyStatus.ACCRUING} - ${daysOverdue} days overdue`,
    });
  });
});
