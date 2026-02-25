import { test, APIRequestContext, Page, expect } from "@playwright/test";

import { setupBeforeEachTest } from "@bciers/e2e/setupBeforeEach";
import { UserRole } from "@bciers/e2e/utils/enums";

import {
  ComplianceOperations,
  ComplianceDisplayStatus,
  GridActionText,
} from "@/compliance-e2e/utils/enums";

import {
  DEFAULT_ADJUSTMENT_LINE,
  DEFAULT_OBLIGATION_AMOUNT_DUE,
  AMOUNT_DUE_AFTER_DECREASE_STILL_UNMET,
  AMOUNT_DUE_AFTER_DECREASE_OBLIGATION_MET,
  REVIEW_OBLIGATION_URL_PATTERN,
} from "@/compliance-e2e/utils/constants";

import { CurrentReportsPOM } from "@/reporting-e2e/poms/current-reports";
import { ComplianceSummariesPOM } from "@/compliance-e2e/poms/compliance-summaries";
import { ReviewComplianceObligationPOM } from "@/compliance-e2e/poms/manage-obligation/review-compliance-obligation";
import { ObligationInvoicePOM } from "@/compliance-e2e/poms/manage-obligation/obligation-invoice";
import { generateComplianceInvoice } from "@/compliance-e2e/utils/helpers";

// 👤 run test using the storageState for role UserRole.INDUSTRY_USER_ADMIN
const e2e = setupBeforeEachTest(UserRole.INDUSTRY_USER_ADMIN);
e2e.describe.configure({ mode: "serial" });

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
      "supplementary decrease below obligation → obligation unmet, no earned credits, invoice adjusted and not void",
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
      "supplementary decrease above obligation → obligation met, earned credits created, invoice adjusted and void",
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

function assertValidComplianceObligationInvoice(opts: {
  invoice: ObligationInvoicePOM;
  expectedVoid: boolean;
  amountDue: RegExp;
  hasAdjustmentLine: boolean;
}) {
  const { invoice, expectedVoid, amountDue, hasAdjustmentLine } = opts;

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

async function runScenario(opts: {
  page: Page;
  request: APIRequestContext;
  scenario: Scenario;
}) {
  const { page, request, scenario } = opts;

  const reports = new CurrentReportsPOM(page);
  const summaries = new ComplianceSummariesPOM(page);
  const review = new ReviewComplianceObligationPOM(page);

  // Report submit -> crv obligation invoice
  await reports.submitReportObligation(false, request);

  // Open obligation CRV
  await summaries.route();
  await summaries.openActionForOperation({
    operationName: OP_NAME,
    linkName: GridActionText.MANAGE_OBLIGATION,
    urlPattern: REVIEW_OBLIGATION_URL_PATTERN,
  });

  // Assert invoice content
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

  // Supplementary decrease scenario
  await reports.route();
  await reports.supplementaryReportObligationDecrease(
    request,
    scenario.decrease,
  );

  // Assert CRVs in summaries grid
  await summaries.route();
  await summaries.assertRowCountForOperation({
    operationName: OP_NAME,
    expectedCount: 1,
  });
  await summaries.assertStatusForOperation(
    OP_NAME,
    scenario.expected.summariesStatus,
  );

  if (scenario.expected.expectEarnedCreditsRow) {
    await assertEarnedCreditsRowExists(page);
  } else {
    await assertNoEarnedCreditsForOperation(page);
  }

  // Open obligation CRV
  await summaries.route();
  await summaries.openActionForOperation({
    operationName: OP_NAME,
    linkName: GridActionText.MANAGE_OBLIGATION,
    urlPattern: REVIEW_OBLIGATION_URL_PATTERN,
  });

  // Assert invoice content
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
  });
}

e2e.describe("Test supplementary decrease obligation → outcomes", () => {
  for (const scenario of scenarios) {
    e2e(scenario.title, async ({ page, request }) => {
      test.slow();
      await runScenario({ page, request, scenario });
    });
  }
});
