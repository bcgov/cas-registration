import { test, APIRequestContext, Page, expect } from "@playwright/test";

import { setupBeforeEachTest } from "@bciers/e2e/setupBeforeEach";
import { UserRole } from "@bciers/e2e/utils/enums";

import {
  ComplianceOperations,
  ComplianceDisplayStatus,
  GridActionText,
} from "@/compliance-e2e/utils/enums";

import { CurrentReportsPOM } from "@/reporting-e2e/poms/current-reports";
import { ComplianceSummariesPOM } from "@/compliance-e2e/poms/compliance-summaries";
import { ComplianceSetupPOM } from "@/compliance-e2e/poms/compliance-setup";
import { ReportSetUpPOM } from "@/reporting-e2e/poms/report-setup";

import {
  DEFAULT_ADJUSTMENT_LINE,
  DEFAULT_OBLIGATION_AMOUNT_DUE,
  POST_ADJUSTMENT_OBLIGATION_AMOUNT_DUE,
  REVIEW_OBLIGATION_URL_PATTERN,
} from "@/compliance-e2e/utils/constants";

import { ReviewComplianceObligationPOM } from "@/compliance-e2e/poms/manage-obligation/review-compliance-obligation";
import { ObligationInvoicePOM } from "@/compliance-e2e/poms/manage-obligation/obligation-invoice";

// 👤 run test using the storageState for role UserRole.INDUSTRY_USER_ADMIN
const e2e = setupBeforeEachTest(UserRole.INDUSTRY_USER_ADMIN);

e2e.describe.configure({ mode: "serial" });

const OP_NAME = ComplianceOperations.OBLIGATION_NOT_MET;

const EARNED_CREDITS_STATUS_TEXT = /Earned credits\s*-\s*not requested/i;
const REQUEST_ISSUANCE_ACTION_TEXT = /Request Issuance of Credits/i;

type SupplementaryDecreaseInput = {
  annualProduction: number;
  productIndex: number;
};

type DecreaseScenario = {
  title: string;
  decrease: SupplementaryDecreaseInput;
  expected: {
    summariesStatus: ComplianceDisplayStatus;
    invoiceIsVoid: boolean;
    amountDue: RegExp;
    hasAdjustmentLine: boolean;
    earnedCreditsRow?: {
      expectedAdditionalRowCountForOperation: number; // e.g., 2 (original + new earned credits row)
      complianceStatusText: RegExp; // e.g., /Earned credits - not requested/i
      actionLinkText?: RegExp; // e.g., /Request Issuance of Credits/i
    };
  };
};

function getVersionIdFromUrl(url: string): number {
  return Number(new URL(url).pathname.split("/").at(-2));
}

async function primeGates(page: Page) {
  const complianceSetupPOM = new ComplianceSetupPOM(page);
  await complianceSetupPOM.primeInvoiceGenerationGate("open");

  const reportSetUpPOM = new ReportSetUpPOM(page);
  await reportSetUpPOM.primeReportingYear("open");
}

async function openManageObligation(summaries: ComplianceSummariesPOM) {
  await summaries.openActionForOperation({
    operationName: OP_NAME,
    linkName: GridActionText.MANAGE_OBLIGATION,
    urlPattern: REVIEW_OBLIGATION_URL_PATTERN,
  });
}

async function generateInvoice(
  review: ReviewComplianceObligationPOM,
  page: Page,
) {
  const versionId = getVersionIdFromUrl(page.url());
  const pdfBuffer = await review.generateInvoiceAndGetPdfBuffer(
    versionId,
    "obligation",
  );
  const invoice = await ObligationInvoicePOM.fromBuffer(pdfBuffer);
  return { versionId, invoice };
}

/**
 * Base invariant: we always still have the original obligation row,
 * but its displayed status can change after the supplementary decrease.
 */
async function assertSingleObligationRowWithStatus(
  summaries: ComplianceSummariesPOM,
  status: ComplianceDisplayStatus,
) {
  await summaries.assertRowCountForOperation({
    operationName: OP_NAME,
    expectedCount: 1,
  });
  await summaries.assertStatusForOperation(OP_NAME, status);
}

/**
 * Earned credits “new record” assertion:
 * - SAME operation name text as the original obligation
 * - compliance status text “Earned credits - not requested”
 * - action link text “Request Issuance of Credits”
 */
async function assertEarnedCreditsRowExists(opts: {
  page: Page;
  expectedAdditionalRowCountForOperation: number;
  complianceStatusText: RegExp;
  actionLinkText?: RegExp;
}) {
  const {
    page,
    expectedAdditionalRowCountForOperation,
    complianceStatusText,
    actionLinkText,
  } = opts;

  // 1) Assert the operation now has N rows total
  const allOpRows = page.getByRole("row").filter({ hasText: OP_NAME });
  await expect(allOpRows).toHaveCount(expectedAdditionalRowCountForOperation);

  // 2) Assert at least one of those rows has the earned credits status text
  const earnedCreditsRow = allOpRows
    .filter({ hasText: complianceStatusText })
    .first();
  await expect(earnedCreditsRow).toBeVisible({ timeout: 30_000 });

  // 3) Assert the action link is present in that row
  if (actionLinkText) {
    await expect(
      earnedCreditsRow.getByRole("link", { name: actionLinkText }),
    ).toBeVisible();
  }
}

function assertInvoice({
  invoice,
  expectedVoid,
  amountDue,
  hasAdjustmentLine,
}: {
  invoice: ObligationInvoicePOM;
  expectedVoid: boolean;
  amountDue: RegExp;
  hasAdjustmentLine: boolean;
}) {
  invoice
    .assertVoid(expectedVoid)
    .assertHasInvoiceNumber()
    .assertHasFeesAndAdjustments()
    .assertComplianceObligationLine();

  if (hasAdjustmentLine) {
    invoice.assertHasAdjustmentLine(DEFAULT_ADJUSTMENT_LINE);
  }

  invoice.assertAmountDue(amountDue);
}

async function runSupplementaryDecreaseFlow({
  page,
  request,
  scenario,
}: {
  page: Page;
  request: APIRequestContext;
  scenario: DecreaseScenario;
}) {
  await primeGates(page);

  const reports = new CurrentReportsPOM(page);
  const summaries = new ComplianceSummariesPOM(page);
  const review = new ReviewComplianceObligationPOM(page);

  // Initial report
  await reports.submitReportObligation(false, request);

  // Navigate to summaries and open obligation
  await summaries.route();
  await summaries.assertRowCountForOperation({
    operationName: OP_NAME,
    expectedCount: 1,
  });
  await openManageObligation(summaries);

  // Initial invoice assertions
  const { invoice: initialInvoice } = await generateInvoice(review, page);
  assertInvoice({
    invoice: initialInvoice,
    expectedVoid: false,
    amountDue: DEFAULT_OBLIGATION_AMOUNT_DUE,
    hasAdjustmentLine: false,
  });

  // Create supplementary decrease
  await reports.route();
  await reports.supplementaryReportObligationDecrease(request, {
    annualProduction: scenario.decrease.annualProduction,
    productIndex: scenario.decrease.productIndex,
  });

  // Assert summaries status for the original obligation row
  await summaries.route();
  await assertSingleObligationRowWithStatus(
    summaries,
    scenario.expected.summariesStatus,
  );

  //Assert for the earned-credits scenario: verify a new earned credits “record” row exists
  if (scenario.expected.earnedCreditsRow) {
    await assertEarnedCreditsRowExists({
      page,
      expectedAdditionalRowCountForOperation:
        scenario.expected.earnedCreditsRow
          .expectedAdditionalRowCountForOperation,
      complianceStatusText:
        scenario.expected.earnedCreditsRow.complianceStatusText,
      actionLinkText: scenario.expected.earnedCreditsRow.actionLinkText,
    });
  }

  // Navigate to obligation
  await openManageObligation(summaries);

  // Post-adjustment invoice assertions (scenario-specific)
  const { invoice: postAdjInvoice } = await generateInvoice(review, page);
  assertInvoice({
    invoice: postAdjInvoice,
    expectedVoid: scenario.expected.invoiceIsVoid,
    amountDue: scenario.expected.amountDue,
    hasAdjustmentLine: scenario.expected.hasAdjustmentLine,
  });
}

e2e.describe(
  "Test supplementary compliance report version obligation decrease flow",
  () => {
    const scenarios: DecreaseScenario[] = [
      {
        title:
          "decrease keeps obligation not met; invoice NOT void; adjustment line present",
        decrease: { annualProduction: 20_000, productIndex: 1 },
        expected: {
          summariesStatus: ComplianceDisplayStatus.OBLIGATION_NOT_MET,
          invoiceIsVoid: false,
          amountDue: POST_ADJUSTMENT_OBLIGATION_AMOUNT_DUE,
          hasAdjustmentLine: true,
        },
      },
      {
        title:
          "decrease creates earned credits; invoice VOID; adjustment line present; earned credits row appears",
        decrease: { annualProduction: 40_000, productIndex: 1 },
        expected: {
          // status of the original obligation row after the decrease
          summariesStatus: ComplianceDisplayStatus.OBLIGATION_MET,

          // invoice behaviour for the obligation invoice after earned credits outcome
          invoiceIsVoid: true,
          amountDue: /0\.00/,
          hasAdjustmentLine: true,

          // Assert “Earned credits - not requested” row exists (same OP_NAME) with action link
          earnedCreditsRow: {
            expectedAdditionalRowCountForOperation: 2, // original obligation row + new earned credits row
            complianceStatusText: EARNED_CREDITS_STATUS_TEXT,
            actionLinkText: REQUEST_ISSUANCE_ACTION_TEXT,
          },
        },
      },
    ];

    for (const scenario of scenarios) {
      e2e(scenario.title, async ({ page, request }) => {
        test.slow();
        await runSupplementaryDecreaseFlow({ page, request, scenario });
      });
    }
  },
);
