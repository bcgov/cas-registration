import { setupBeforeEachTest } from "@bciers/e2e/setupBeforeEach";
import { UserRole } from "@bciers/e2e/utils/enums";
import { takeStabilizedScreenshot } from "@bciers/e2e/utils/helpers";
import { analyzeAccessibility } from "@bciers/e2e/utils/a11y";
import { PenaltyStatus } from "@/compliance-e2e/utils/enums";
import {
  DEFAULT_DAYS_OVERDUE,
  PENALTY_TARGET_ACCRUAL_DATE,
} from "@/compliance-e2e/utils/constants";
import {
  OverdueObligation,
  openPenaltyCalculator,
  restoreOverdueObligation,
  setupOverdueObligationAsIndustryUser,
} from "@/compliance-e2e/utils/penalty-setup";

// 👤 run test using the storageState for internal staff (CAS Analyst)
const internalTest = setupBeforeEachTest(UserRole.CAS_ANALYST);

const daysOverdue = DEFAULT_DAYS_OVERDUE;

// ---------------------------------------------------------------------------
// Internal Suite (CAS Analyst)
// ---------------------------------------------------------------------------
internalTest.describe("Automatic overdue penalty flow - CAS analyst", () => {
  // Each test submits a report before reaching the penalty calculator
  internalTest.describe.configure({ timeout: 120_000 });

  let overdueObligation: OverdueObligation | undefined;

  // The compliance deadline is shared by every report of the period, so put it back
  internalTest.afterEach(async ({ page, request }) => {
    await restoreOverdueObligation(page, request, overdueObligation);
    overdueObligation = undefined;
  });

  internalTest(
    "when obligation is overdue, obligation renders daily penalty calculations",
    async ({ page, request, browser, baseURL, happoScreenshot }) => {
      // An industry user submits the report, then its compliance deadline moves into the past
      overdueObligation = await setupOverdueObligationAsIndustryUser(
        browser,
        baseURL,
        request,
      );

      const penaltyCalculator = await openPenaltyCalculator(
        page,
        overdueObligation.complianceReportVersionId,
      );

      // Select a final accrual date to populate calculation rows in the grid
      await penaltyCalculator.setFinalAccrualDate(PENALTY_TARGET_ACCRUAL_DATE);
      await penaltyCalculator.assertPenaltyGridLoaded();
      await analyzeAccessibility(
        page,
        "Penalty calculator - automatic overdue",
      );

      await penaltyCalculator.hideDateInputFromScreenshot();
      await takeStabilizedScreenshot(happoScreenshot, page, {
        component: "Penalty calculator",
        variant: `status: ${PenaltyStatus.ACCRUING} - ${daysOverdue} days overdue`,
      });
    },
  );
});
