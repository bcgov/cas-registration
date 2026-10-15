import type { APIRequestContext, Browser, Page } from "@playwright/test";
import { UserRole } from "@bciers/e2e/utils/enums";
import { getStorageStateForRole } from "@bciers/e2e/utils/helpers";
import { CurrentReportsPOM } from "@/reporting-e2e/poms/current-reports";
import { ReportSetUpPOM } from "@/reporting-e2e/poms/report-setup";
import { ReportIDs } from "@/reporting-e2e/utils/enums";
import { ComplianceSetupPOM } from "@/compliance-e2e/poms/compliance-setup";
import { ComplianceSummariesPOM } from "@/compliance-e2e/poms/compliance-summaries";
import { ManageObligationTaskListPOM } from "@/compliance-e2e/poms/manage-obligation/tasklist";
import { PenaltyCalculatorPOM } from "@/compliance-e2e/poms/manage-obligation/penalty-calculator";
import {
  ComplianceOperations,
  GridActionText,
  PenaltyStatus,
} from "@/compliance-e2e/utils/enums";
import {
  DEFAULT_DAYS_OVERDUE,
  REVIEW_OBLIGATION_URL_PATTERN,
  SUPPLEMENTARY_INCREASE_ANNUAL_PRODUCTION,
  SUPPLEMENTARY_INCREASE_PRODUCT_INDEX,
} from "@/compliance-e2e/utils/constants";

/**
 * An obligation whose compliance deadline was moved into the past.
 * Pass it to restoreOverdueObligation once the test is done.
 */
export interface OverdueObligation {
  complianceReportVersionId: number;
  reportVersionId: number;
  /** The compliance deadline before it was moved */
  originalComplianceDeadline: string;
}

/**
 * Submits the "Obligation not met" report as an industry user, so the obligation and its invoice
 * are created by the real submission flow. Optionally follows it with a supplementary report that
 * increases the obligation, which creates a supplementary compliance report version.
 *
 * The invoice must exist before the supplementary report is submitted: otherwise the original version
 * is superseded instead of the increase creating a supplementary version.
 *
 * @param page A page signed in as an industry user
 * @returns The report version id of the last submitted report
 */
export async function submitObligationReports(
  page: Page,
  apiContext: APIRequestContext,
  options?: { supplementaryIncrease?: boolean },
): Promise<number> {
  await new ComplianceSetupPOM(page).primeInvoiceGenerationGate("open");
  await new ReportSetUpPOM(page).primeReportingYear("open");

  const reports = new CurrentReportsPOM(page);
  await reports.submitReportObligation(false, apiContext);

  if (!options?.supplementaryIncrease) {
    return Number(ReportIDs.OBLIGATION_NOT_MET);
  }

  await reports.route();
  return reports.supplementaryReportObligationIncrease(apiContext, {
    annualProduction: SUPPLEMENTARY_INCREASE_ANNUAL_PRODUCTION,
    productIndex: SUPPLEMENTARY_INCREASE_PRODUCT_INDEX,
  });
}

/**
 * Prepares an overdue obligation for a CAS analyst test: signs in as an industry user in a separate browser
 * context, submits the reports, then moves their dates into the past so penalties accrue.
 *
 * The industry user gets its own context so the test's page (the CAS analyst's) stays the one Happo
 * screenshots, since happoScreenshot only works on the test's page.
 *
 * @returns The obligation, to restore its compliance deadline after the test
 */
export async function setupOverdueObligationAsIndustryUser(
  browser: Browser,
  baseURL: string | undefined,
  apiContext: APIRequestContext,
  options?: { supplementaryIncrease?: boolean; daysAfterDeadline?: number },
): Promise<OverdueObligation> {
  const context = await browser.newContext({
    storageState: getStorageStateForRole(UserRole.INDUSTRY_USER_ADMIN),
    baseURL,
  });

  try {
    const page = await context.newPage();
    const reportVersionId = await submitObligationReports(page, apiContext, {
      supplementaryIncrease: options?.supplementaryIncrease,
    });

    const result = await new PenaltyCalculatorPOM(page).makeOverdue(
      apiContext,
      {
        report_version_id: reportVersionId,
        days_overdue: DEFAULT_DAYS_OVERDUE,
        days_after_deadline: options?.daysAfterDeadline,
      },
    );

    return {
      complianceReportVersionId: result.compliance_report_version_id,
      reportVersionId,
      originalComplianceDeadline: result.original_compliance_deadline,
    };
  } finally {
    await context.close();
  }
}

/**
 * Puts back the compliance deadline that setupOverdueObligationAsIndustryUser moved.
 * The deadline is shared by every report of the compliance period, so call this after each test
 * (also when it fails) to keep other specs from running with an overdue period.
 *
 * @param page Any page signed in as a user, used to authenticate the stub call
 * @param overdueObligation Undefined when the test failed before the deadline was moved
 */
export async function restoreOverdueObligation(
  page: Page,
  apiContext: APIRequestContext,
  overdueObligation?: OverdueObligation,
): Promise<void> {
  if (!overdueObligation) return;

  await new PenaltyCalculatorPOM(page).restoreComplianceDeadline(
    apiContext,
    overdueObligation.reportVersionId,
    overdueObligation.originalComplianceDeadline,
  );
}

/**
 * Opens the penalty calculator for a compliance report version from the compliance summaries grid,
 * checking its penalty status along the way.
 *
 * @param page A page signed in as a CAS analyst
 */
export async function openPenaltyCalculator(
  page: Page,
  complianceReportVersionId: number,
): Promise<PenaltyCalculatorPOM> {
  const summaries = new ComplianceSummariesPOM(page);
  await summaries.route();

  // The operation has a row per compliance report version, so pin the row by version
  await summaries.assertPenaltyStatusForOperation(
    ComplianceOperations.OBLIGATION_NOT_MET,
    PenaltyStatus.ACCRUING,
    complianceReportVersionId,
  );
  await summaries.openActionForOperation({
    operationName: ComplianceOperations.OBLIGATION_NOT_MET,
    linkName: GridActionText.VIEW_DETAILS,
    urlPattern: REVIEW_OBLIGATION_URL_PATTERN,
    complianceReportVersionId,
  });

  await new ManageObligationTaskListPOM(page).clickPenaltyCalculator();

  const penaltyCalculator = new PenaltyCalculatorPOM(page);
  await penaltyCalculator.assertUrlCorrect(complianceReportVersionId);

  return penaltyCalculator;
}
