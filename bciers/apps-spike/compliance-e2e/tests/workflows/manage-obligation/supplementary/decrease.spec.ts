import { APIRequestContext, Page, expect } from "@playwright/test";

import { setupBeforeEachTest } from "@bciers/e2e/setupBeforeEach";
import { UserRole } from "@bciers/e2e/utils/enums";

import {
  ComplianceOperations,
  ComplianceDisplayStatus,
  GridActionText,
} from "@/compliance-e2e/utils/enums";

import {
  DEFAULT_OBLIGATION_AMOUNT_DUE,
  AMOUNT_DUE_AFTER_DECREASE_STILL_UNMET,
  AMOUNT_DUE_AFTER_DECREASE_OBLIGATION_MET,
  REVIEW_OBLIGATION_URL_PATTERN,
  SUPPLEMENTARY_ADJUSTMENT_LINE,
  SUPPLEMENTARY_ADJUSTMENT_VOID_LINE,
} from "@/compliance-e2e/utils/constants";

import { CurrentReportsPOM } from "@/reporting-e2e/poms/current-reports";
import { ComplianceSummariesPOM } from "@/compliance-e2e/poms/compliance-summaries";
import { ReviewComplianceObligationPOM } from "@/compliance-e2e/poms/manage-obligation/review-compliance-obligation";
import { ObligationInvoicePOM } from "@/compliance-e2e/poms/manage-obligation/obligation-invoice";
import { generateComplianceInvoice } from "@/compliance-e2e/utils/helpers";
import { ComplianceSetupPOM } from "@/compliance-e2e/poms/compliance-setup";
import { ReportSetUpPOM } from "@/reporting-e2e/poms/report-setup";
import { takeStabilizedScreenshot } from "@bciers/e2e/utils/helpers";

// 👤 run test using the storageState for role UserRole.INDUSTRY_USER_ADMIN
const test = setupBeforeEachTest(UserRole.INDUSTRY_USER_ADMIN);
test.describe.configure({ mode: "serial" });

const OP_NAME = ComplianceOperations.OBLIGATION_NOT_MET;

const earnedCreditsStatusRegex = new RegExp(
  ComplianceDisplayStatus.EARNED_CREDITS_NOT_REQUESTED.replace(/\s+/g, "\\s*"),
  "i",
);

const requestIssuanceActionRegex = new RegExp(
  GridActionText.REQUEST_ISSUANCE_CREDITS.replace(/\s+/g, "\\s*"),
  "i",
);

type Scenario = {
  title: string;
  decrease: { annualProduction: number; productIndex: number };
  expected: {
    summariesStatus: ComplianceDisplayStatus;
    invoiceIsVoid: boolean;
    amountDue: RegExp;
    hasAdjustmentLine: boolean;
    expectEarnedCreditsRow: boolean;
  };
};

const scenarios: Scenario[] = [
  {
    title:
      "decrease some of obligation → obligation unmet, no earned credits, invoice adjusted and not void",
    decrease: { annualProduction: 20_000, productIndex: 1 },
    expected: {
      summariesStatus: ComplianceDisplayStatus.OBLIGATION_NOT_MET,
      invoiceIsVoid: false,
      amountDue: AMOUNT_DUE_AFTER_DECREASE_STILL_UNMET,
      hasAdjustmentLine: true,
      expectEarnedCreditsRow: false,
    },
  },
  {
    title:
      "decrease to meet obligation → obligation met, no earned credits, invoice adjusted and void",
    decrease: { annualProduction: 27_290.8017, productIndex: 1 },
    expected: {
      summariesStatus: ComplianceDisplayStatus.OBLIGATION_MET,
      invoiceIsVoid: true,
      amountDue: AMOUNT_DUE_AFTER_DECREASE_OBLIGATION_MET,
      hasAdjustmentLine: true,
      expectEarnedCreditsRow: false,
    },
  },
  {
    title:
      "decrease to over-correct obligation → obligation met, earned credits created, invoice adjusted and void",
    decrease: { annualProduction: 400_000, productIndex: 1 },
    expected: {
      summariesStatus: ComplianceDisplayStatus.OBLIGATION_MET,
      invoiceIsVoid: true,
      amountDue: AMOUNT_DUE_AFTER_DECREASE_OBLIGATION_MET,
      hasAdjustmentLine: true,
      expectEarnedCreditsRow: true,
    },
  },
];

async function primeGates(page: Page) {
  const complianceSetupPOM = new ComplianceSetupPOM(page);
  await complianceSetupPOM.primeInvoiceGenerationGate("open");

  const reportSetUpPOM = new ReportSetUpPOM(page);
  await reportSetUpPOM.primeReportingYear("open");
}

function assertValidComplianceObligationInvoice(opts: {
  invoice: ObligationInvoicePOM;
  expectedVoid: boolean;
  amountDue: RegExp;
  hasAdjustmentLine: boolean;
  adjustmentLineMatcher?: RegExp;
}) {
  const {
    invoice,
    expectedVoid,
    amountDue,
    hasAdjustmentLine,
    adjustmentLineMatcher,
  } = opts;

  invoice
    .assertVoid(expectedVoid)
    .assertHasInvoiceNumber()
    .assertHasFeesAndAdjustments()
    .assertComplianceObligationLine()
    .assertAmountDue(amountDue);

  if (hasAdjustmentLine) {
    invoice.assertHasAdjustmentLine(
      adjustmentLineMatcher ?? SUPPLEMENTARY_ADJUSTMENT_LINE,
    );
  }
}

async function assertNoEarnedCreditsForOperation(page: Page) {
  const opRows = page.getByRole("row").filter({ hasText: OP_NAME });

  await expect(opRows).toHaveCount(1);
  await expect(
    opRows.filter({ hasText: earnedCreditsStatusRegex }),
  ).toHaveCount(0);
  await expect(
    opRows.getByRole("link", { name: requestIssuanceActionRegex }),
  ).toHaveCount(0);
}

async function assertEarnedCreditsRowExists(page: Page) {
  const opRows = page.getByRole("row").filter({ hasText: OP_NAME });

  await expect(opRows).toHaveCount(2);
  await expect(
    opRows.filter({ hasText: earnedCreditsStatusRegex }),
  ).toHaveCount(1);
  await expect(
    opRows.getByRole("link", { name: requestIssuanceActionRegex }),
  ).toBeVisible();
}

function getObligationActionLinkName(
  status: ComplianceDisplayStatus,
): GridActionText {
  switch (status) {
    case ComplianceDisplayStatus.OBLIGATION_MET:
      return GridActionText.VIEW_DETAILS;
    default:
      return GridActionText.MANAGE_OBLIGATION;
  }
}

async function runScenario(opts: {
  page: Page;
  request: APIRequestContext;
  scenario: Scenario;
  happoScreenshot: any;
}) {
  const { page, request, scenario, happoScreenshot } = opts;
  await primeGates(page);

  const reports = new CurrentReportsPOM(page);
  const summaries = new ComplianceSummariesPOM(page);
  const review = new ReviewComplianceObligationPOM(page);

  // Report submit -> crv obligation invoice
  await reports.submitReportObligation(false, request);

  // Open crv
  await summaries.route();
  await summaries.openActionForOperation({
    operationName: OP_NAME,
    linkName: GridActionText.MANAGE_OBLIGATION,
    urlPattern: REVIEW_OBLIGATION_URL_PATTERN,
  });

  // Assert invoice content (initial)
  const initialInvoice = await generateComplianceInvoice({
    page,
    reviewPOM: review,
    type: "obligation",
  });

  assertValidComplianceObligationInvoice({
    invoice: initialInvoice,
    expectedVoid: false,
    amountDue: DEFAULT_OBLIGATION_AMOUNT_DUE,
    hasAdjustmentLine: false,
  });

  // Submit supplementary report decrease scenario
  await reports.route();
  await reports.supplementaryReportObligationDecrease(
    request,
    scenario.decrease,
  );

  // Assert CRV status after decrease
  await summaries.route();
  await summaries.assertStatusForOperation(
    OP_NAME,
    scenario.expected.summariesStatus,
  );

  // Assert earned credits row in summaries
  if (scenario.expected.expectEarnedCreditsRow) {
    await assertEarnedCreditsRowExists(page);
  } else {
    await assertNoEarnedCreditsForOperation(page);
  }

  await takeStabilizedScreenshot(happoScreenshot, page, {
    component: "Supplementary Report Decrease Obligation",
    variant: scenario.title.split("→")[0].trim(),
  });

  // Open obligation CRV
  await summaries.route();
  await summaries.openActionForOperation({
    operationName: OP_NAME,
    linkName: getObligationActionLinkName(scenario.expected.summariesStatus),
    urlPattern: REVIEW_OBLIGATION_URL_PATTERN,
  });

  // Assert invoice content (post-adjustment)
  const postAdjInvoice = await generateComplianceInvoice({
    page,
    reviewPOM: review,
    type: "obligation",
  });

  assertValidComplianceObligationInvoice({
    invoice: postAdjInvoice,
    expectedVoid: scenario.expected.invoiceIsVoid,
    amountDue: scenario.expected.amountDue,
    hasAdjustmentLine: scenario.expected.hasAdjustmentLine,
    adjustmentLineMatcher: scenario.expected.invoiceIsVoid
      ? SUPPLEMENTARY_ADJUSTMENT_VOID_LINE
      : SUPPLEMENTARY_ADJUSTMENT_LINE,
  });
}

test.describe("Test supplementary report decreases obligation", () => {
  for (const scenario of scenarios) {
    test(`${scenario.title}`, async ({ page, request, happoScreenshot }) => {
      await runScenario({ page, request, scenario, happoScreenshot });
    });
  }
});
