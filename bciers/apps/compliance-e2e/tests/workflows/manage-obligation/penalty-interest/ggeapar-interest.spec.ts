import { setupBeforeEachTest } from "@bciers/e2e/setupBeforeEach";
import { UserRole } from "@bciers/e2e/utils/enums";
import { takeStabilizedScreenshot } from "@bciers/e2e/utils/helpers";
import {
  DEFAULT_DAYS_OVERDUE,
  LATE_SUBMISSION_DAYS_AFTER_DEADLINE,
  PENALTY_TARGET_ACCRUAL_DATE,
} from "@/compliance-e2e/utils/constants";
import {
  OverdueObligation,
  openPenaltyCalculator,
  restoreOverdueObligation,
  setupOverdueObligationAsIndustryUser,
} from "@/compliance-e2e/utils/penalty-setup";

// 👤 run test using the storageState for internal staff (CAS Analyst)
const test = setupBeforeEachTest(UserRole.CAS_ANALYST);

const daysOverdue = DEFAULT_DAYS_OVERDUE;

test.describe("GGEAPAR interest flow - CAS analyst", () => {
  // Each test has an industry user submit one or two reports before reaching the penalty calculator
  test.describe.configure({ timeout: 120_000 });

  let overdueObligation: OverdueObligation | undefined;

  // The compliance deadline is shared by every report of the period, so put it back
  test.afterEach(async ({ page, request }) => {
    await restoreOverdueObligation(page, request, overdueObligation);
    overdueObligation = undefined;
  });

  test("when the report is not supplementary, selecting GGEAPAR shows the not-applicable alert", async ({
    page,
    request,
    browser,
    baseURL,
    happoScreenshot,
  }) => {
    // Original report only, with its compliance deadline moved into the past
    overdueObligation = await setupOverdueObligationAsIndustryUser(
      browser,
      baseURL,
      request,
    );

    const penaltyCalculator = await openPenaltyCalculator(
      page,
      overdueObligation.complianceReportVersionId,
    );

    // Alert is absent for the default Automatic overdue type
    await penaltyCalculator.assertGgeaparNotApplicableHidden();

    // Switch to GGEAPAR and verify the alert
    await penaltyCalculator.selectGgeaparPenaltyType();
    await penaltyCalculator.assertGgeaparNotApplicable();

    // The final accrual date defaults to today, so it would change the screenshot daily
    await penaltyCalculator.hideDatesFromScreenshot();
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "Penalty calculator",
      variant: "GGEAPAR - not applicable (non-supplementary report)",
    });
  });

  test("when a supplementary report was submitted late, GGEAPAR interest accrues and renders daily calculations", async ({
    page,
    request,
    browser,
    baseURL,
    happoScreenshot,
  }) => {
    // Original report plus a supplementary report that increases the obligation,
    // with the supplementary submission dated after the compliance deadline
    overdueObligation = await setupOverdueObligationAsIndustryUser(
      browser,
      baseURL,
      request,
      {
        supplementaryIncrease: true,
        daysAfterDeadline: LATE_SUBMISSION_DAYS_AFTER_DEADLINE,
      },
    );

    const penaltyCalculator = await openPenaltyCalculator(
      page,
      overdueObligation.complianceReportVersionId,
    );

    // Switch to GGEAPAR: interest applies, so no not-applicable alert
    await penaltyCalculator.selectGgeaparPenaltyType();
    await penaltyCalculator.assertGgeaparNotApplicableHidden();

    // Select a final accrual date and verify the grid is populated
    await penaltyCalculator.setFinalAccrualDate(PENALTY_TARGET_ACCRUAL_DATE);
    await penaltyCalculator.assertPenaltyGridLoaded();
    await penaltyCalculator.assertGgeaparNotApplicableHidden();

    await penaltyCalculator.hideDatesFromScreenshot();
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "Penalty calculator",
      variant: `GGEAPAR - accruing (supplementary, ${daysOverdue} days overdue)`,
    });
  });
});
