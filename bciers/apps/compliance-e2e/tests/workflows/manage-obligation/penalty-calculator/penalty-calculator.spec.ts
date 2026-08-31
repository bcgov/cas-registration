import { expect } from "@playwright/test";
import { setupBeforeAllTest } from "@bciers/e2e/setupBeforeAll";
import { UserRole } from "@bciers/e2e/utils/enums";
import {
  openNewBrowserContextAs,
  setupTestEnvironment,
  takeStabilizedScreenshot,
} from "@bciers/e2e/utils/helpers";

import {
  ComplianceDisplayStatus,
  ComplianceOperations,
  GridActionText,
} from "@/compliance-e2e/utils/enums";
import { REVIEW_OBLIGATION_URL_PATTERN } from "@/compliance-e2e/utils/constants";

import { CurrentReportsPOM } from "@/reporting-e2e/poms/current-reports";
import { ComplianceSummariesPOM } from "@/compliance-e2e/poms/compliance-summaries";
import { ComplianceSetupPOM } from "@/compliance-e2e/poms/compliance-setup";

const test = setupBeforeAllTest(UserRole.CAS_ANALYST);

const PENALTY_CALCULATOR_URL_PATTERN = new RegExp(
  "/compliance/compliance-administration/compliance-summaries/\\d+/penalty-calculator(?:\\?.*)?$",
);

async function openPenaltyCalculatorFromComplianceSummary(page: any) {
  const summaries = new ComplianceSummariesPOM(page);

  await summaries.route();
  await summaries.openActionForOperation({
    operationName: ComplianceOperations.OBLIGATION_NOT_MET,
    linkName: GridActionText.VIEW_DETAILS,
    urlPattern: REVIEW_OBLIGATION_URL_PATTERN,
  });

  const penaltyCalculatorTaskButton = page.getByRole("button", {
    name: /Penalty calculator/i,
  });
  await expect(penaltyCalculatorTaskButton).toBeVisible();
  await penaltyCalculatorTaskButton.click();
}

const OBLIGATION_ACTION_LINK = /Manage Obligation|View Details/i;

async function assertPenaltyCalculatorLoaded(page: any) {
  await expect(page).toHaveURL(PENALTY_CALCULATOR_URL_PATTERN);

  await expect(
    page
      .getByTestId("field-template-label")
      .filter({ hasText: /Penalty Calculator/i })
      .first(),
  ).toBeVisible();
  await expect(
    page.getByText("Automatic overdue penalty:", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("GGEAPAR interest:", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByLabel(/2\. Select final day of penalty accrual/i),
  ).toBeVisible();
  await expect(
    page.getByText("Penalty summary", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Accrual data", { exact: true })).toBeVisible();
}

async function ensureFinalDayOfAccrualInputValue(page: any) {
  const finalDayOfAccrualInput = page.getByLabel(
    /2\. Select final day of penalty accrual/i,
  );
  await finalDayOfAccrualInput.fill("2027-01-10");
  await finalDayOfAccrualInput.press("Tab");

  await expect(finalDayOfAccrualInput).toHaveValue(/\d{4}-\d{2}-\d{2}/);
  return finalDayOfAccrualInput;
}

async function assertDaysLateAndAccrualDataPopulated(page: any) {
  await expect(async () => {
    const daysLateValueText = (
      await page
        .locator("p", { hasText: "Days late" })
        .first()
        .locator("xpath=following-sibling::p[1]")
        .textContent()
    )?.trim();

    const daysLateValue = Number(daysLateValueText);
    expect(Number.isFinite(daysLateValue)).toBe(true);
    expect(daysLateValue).toBeGreaterThan(0);

    const accrualDataTable = page
      .getByText("Accrual data", { exact: true })
      .locator("xpath=following::table[1]");
    await expect(accrualDataTable).toBeVisible();

    const dataRows = accrualDataTable.locator("tbody tr");
    await expect(dataRows.first()).toBeVisible();
    expect(await dataRows.count()).toBeGreaterThan(0);

    const firstRowCells = dataRows.first().locator("td");
    expect(await firstRowCells.count()).toBeGreaterThan(1);

    const firstCellText = (await firstRowCells.first().textContent())?.trim();
    expect(firstCellText).not.toBe("-");
  }).toPass({ timeout: 30_000 });
}

function parseOutstandingBalanceTco2e(value: string): number {
  const normalized = value.replace(/,/g, "");
  const match = normalized.match(/([0-9]+(?:\.[0-9]+)?)\s*tCO2e/i);
  if (!match?.[1]) {
    throw new Error(
      `Could not parse outstanding balance tCO2e from "${value}"`,
    );
  }
  return Number(match[1]);
}

async function getOperationRowOutstandingBalances(page: any) {
  const rows = page
    .locator('.MuiDataGrid-root [role="row"]')
    .filter({ hasText: ComplianceOperations.OBLIGATION_NOT_MET });

  const rowCount = await rows.count();
  const rowData: Array<{
    status: string;
    outstandingBalance: number;
    hasActionLink: boolean;
  }> = [];

  for (let i = 0; i < rowCount; i++) {
    const row = rows.nth(i);
    const status =
      (
        await row
          .locator('[role="gridcell"][data-field="display_status"]')
          .first()
          .textContent()
      )?.trim() ?? "";
    if (!status) {
      continue;
    }

    const outstandingBalanceText =
      (
        await row
          .locator('[role="gridcell"][data-field="outstanding_balance_tco2e"]')
          .first()
          .textContent()
      )?.trim() ?? "";
    if (!outstandingBalanceText) {
      continue;
    }

    rowData.push({
      status,
      outstandingBalance: parseOutstandingBalanceTco2e(outstandingBalanceText),
      hasActionLink:
        (await row
          .getByRole("link", { name: OBLIGATION_ACTION_LINK })
          .count()) > 0,
    });
  }

  return rowData;
}

async function seedSupplementaryReportWithLargerObligationForGgeapar() {
  const industryPage = await openNewBrowserContextAs(
    UserRole.INDUSTRY_USER_ADMIN,
  );
  const industryContext = industryPage.context();

  try {
    const complianceSetup = new ComplianceSetupPOM(industryPage);
    await complianceSetup.primeInvoiceGenerationGate("open");

    const summaries = new ComplianceSummariesPOM(industryPage);
    const reports = new CurrentReportsPOM(industryPage);

    // Step 1: create a supplementary version that decreases the obligation amount.
    await reports.route();
    const firstSupplementaryCrvId =
      await reports.supplementaryReportObligationDecrease(
        industryContext.request,
        {
          annualProduction: 20_000,
          productIndex: 1,
          reviewChangesReason:
            "Supplementary submission to establish lower obligation baseline for GGEAPAR test",
        },
      );
    await complianceSetup.primeObligationSubmittedAfterDeadlines(
      firstSupplementaryCrvId,
    );

    await summaries.route();
    const baselineRows = await getOperationRowOutstandingBalances(industryPage);
    const baselineActionableRow = baselineRows.find(
      (row) =>
        row.hasActionLink && /obligation\s*-\s*not\s*met/i.test(row.status),
    );
    if (!baselineActionableRow) {
      throw new Error(
        "Expected an actionable Obligation - not met row after first supplementary submission",
      );
    }
    const baselineOutstandingBalance =
      baselineActionableRow!.outstandingBalance;

    // Step 2: create another supplementary version with lower production so
    // obligation increases relative to the lowered baseline.
    await reports.route();
    const secondSupplementaryCrvId =
      await reports.supplementaryReportObligationDecrease(
        industryContext.request,
        {
          annualProduction: 1,
          productIndex: 1,
          reviewChangesReason:
            "Supplementary submission to increase obligation for GGEAPAR penalty test",
        },
      );
    await complianceSetup.primeObligationSubmittedAfterDeadlines(
      secondSupplementaryCrvId,
    );

    await summaries.route();
    await expect(async () => {
      const postSupplementaryRows =
        await getOperationRowOutstandingBalances(industryPage);
      const pendingInvoiceRows = postSupplementaryRows.filter((row) =>
        /pending\s*invoice\s*creation/i.test(row.status),
      );
      if (pendingInvoiceRows.length === 0) {
        throw new Error(
          "Expected at least one Pending invoice creation row after supplementary submission",
        );
      }

      const highestPendingOutstandingBalance = Math.max(
        ...pendingInvoiceRows.map((row) => row.outstandingBalance),
      );

      if (highestPendingOutstandingBalance <= baselineOutstandingBalance) {
        throw new Error(
          `Expected supplementary obligation outstanding balance to increase beyond baseline ${baselineOutstandingBalance}; got ${highestPendingOutstandingBalance}`,
        );
      }
    }).toPass({ timeout: 30_000 });
  } finally {
    const industryBrowser = industryContext.browser();
    await industryContext.close();
    await industryBrowser?.close();
  }
}

test.describe.configure({ mode: "serial" });

test.describe("Internal penalty calculator from compliance summaries", () => {
  test.describe.configure({ timeout: 180_000 });

  test.beforeAll(async () => {
    await setupTestEnvironment();

    // Seed an unmet-obligation summary so internal users can open penalty calculator.
    const industryPage = await openNewBrowserContextAs(
      UserRole.INDUSTRY_USER_ADMIN,
    );
    const industryContext = industryPage.context();

    try {
      const complianceSetup = new ComplianceSetupPOM(industryPage);
      await complianceSetup.primeInvoiceGenerationGate("open");

      const reports = new CurrentReportsPOM(industryPage);
      await reports.submitReportObligation(false, industryContext.request);

      const summaries = new ComplianceSummariesPOM(industryPage);
      await summaries.route();
      await summaries.assertStatusForOperation(
        ComplianceOperations.OBLIGATION_NOT_MET,
        ComplianceDisplayStatus.OBLIGATION_NOT_MET,
      );
    } finally {
      const industryBrowser = industryContext.browser();
      await industryContext.close();
      await industryBrowser?.close();
    }
  });

  test("internal user can open and use automatic overdue penalty calculator from manage obligation", async ({
    page,
    happoScreenshot,
  }: any) => {
    await openPenaltyCalculatorFromComplianceSummary(page);
    await assertPenaltyCalculatorLoaded(page);

    const automaticOverdueRadio = page.getByRole("radio", {
      name: /Automatic overdue/i,
    });
    const ggeaparRadio = page.getByRole("radio", {
      name: /GGEAPAR/i,
    });

    await expect(automaticOverdueRadio).toHaveAttribute("aria-checked", "true");
    await expect(ggeaparRadio).toHaveAttribute("aria-checked", "false");

    await ensureFinalDayOfAccrualInputValue(page);
    await assertDaysLateAndAccrualDataPopulated(page);

    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "Penalty Calculator",
      variant: "internal - automatic overdue selected",
    });
  });

  test("internal user can open and use GGEAPAR penalty calculator from manage obligation", async ({
    page,
    happoScreenshot,
  }: any) => {
    await seedSupplementaryReportWithLargerObligationForGgeapar();

    await openPenaltyCalculatorFromComplianceSummary(page);
    await assertPenaltyCalculatorLoaded(page);
    await ensureFinalDayOfAccrualInputValue(page);

    const automaticOverdueRadio = page.getByRole("radio", {
      name: /Automatic overdue/i,
    });
    const ggeaparRadio = page.getByRole("radio", {
      name: /GGEAPAR/i,
    });

    await ggeaparRadio.click();

    await expect(ggeaparRadio).toHaveAttribute("aria-checked", "true");
    await expect(automaticOverdueRadio).toHaveAttribute(
      "aria-checked",
      "false",
    );

    await assertDaysLateAndAccrualDataPopulated(page);

    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "Penalty Calculator",
      variant: "internal - ggeapar selected",
    });
  });
});
