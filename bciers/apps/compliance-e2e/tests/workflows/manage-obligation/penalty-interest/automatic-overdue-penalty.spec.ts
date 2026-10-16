import { setupBeforeEachTest } from "@bciers/e2e/setupBeforeEach";
import { UserRole } from "@bciers/e2e/utils/enums";
import { takeStabilizedScreenshot } from "@bciers/e2e/utils/helpers";
import { PenaltyStatus } from "@/compliance-e2e/utils/enums";
import {
  DEFAULT_DAYS_OVERDUE,
  PENALTY_TARGET_ACCRUAL_DATE,
} from "@/compliance-e2e/utils/constants";
import { PenaltyCalculatorPOM } from "@/compliance-e2e/poms/manage-obligation/penalty-calculator";
import {
  OverdueObligation,
  openPenaltyCalculator,
  restoreOverdueObligation,
  setupOverdueObligationAsIndustryUser,
  submitObligationReports,
} from "@/compliance-e2e/utils/penalty-setup";

// 👤 Setup scoped test runners per role
const internalTest = setupBeforeEachTest(UserRole.CAS_ANALYST);
const externalTest = setupBeforeEachTest(UserRole.INDUSTRY_USER_ADMIN);

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

      await penaltyCalculator.hideDateInputFromScreenshot();
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
  externalTest.describe.configure({ timeout: 120_000 });

  let overdueObligation: OverdueObligation | undefined;

  externalTest.afterEach(async ({ page, request }) => {
    await restoreOverdueObligation(page, request, overdueObligation);
    overdueObligation = undefined;
  });

  externalTest(
    "when navigating directly to the penalty calculator, the page is not found",
    async ({ page, request }) => {
      const reportVersionId = await submitObligationReports(page, request);
      const penaltyCalculator = new PenaltyCalculatorPOM(page);
      const overdueResult = await penaltyCalculator.makeOverdue(request, {
        report_version_id: reportVersionId,
      });
      overdueObligation = {
        complianceReportVersionId: overdueResult.compliance_report_version_id,
        reportVersionId,
        originalComplianceDeadline: overdueResult.original_compliance_deadline,
      };

      // The penalty calculator only exists for internal users, so it is never linked in the industry task list.
      // Guard against it being reachable by URL instead.
      await penaltyCalculator.route(
        overdueObligation.complianceReportVersionId,
      );
      await penaltyCalculator.assertNotFound();
    },
  );
});
