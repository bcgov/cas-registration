import { expect } from "@playwright/test";
import { setupBeforeAllTest } from "@bciers/e2e/setupBeforeAll";
import { UserRole } from "@bciers/e2e/utils/enums";
import { analyzeAccessibility } from "@bciers/e2e/utils/a11y";
import { takeStabilizedScreenshot } from "@bciers/e2e/utils/helpers";
import { ReportIDs } from "@/reporting-e2e/utils/enums";
import { CurrentReportsPOM } from "@/reporting-e2e/poms/current-reports";
import { CurrentReportPOM } from "@/reporting-e2e/poms/current-report";

const test = setupBeforeAllTest(UserRole.INDUSTRY_USER_ADMIN);

test.describe.configure({ mode: "serial" });

test.describe("Compliance Summary: how emissions attributable for compliance was calculated", () => {
  test("Annual report (2025) shows the EAFC formula and totals", async ({
    page,
    happoScreenshot,
  }) => {
    // Fixture draft report: Compliance SFO - Earned credits (2025, annual)
    const grid = new CurrentReportsPOM(page);
    await grid.gotoComplianceSummary(ReportIDs.EARNED_CREDITS);

    const report = new CurrentReportPOM(page);
    await report.verifyComplianceSummary();

    const panel = await report.openEafcCalculationBreakdown();

    await expect(
      panel.getByRole("heading", {
        name: "Emissions attributable for compliance",
      }),
    ).toBeVisible();
    await expect(panel.getByTestId("eafc-formula")).toHaveText(
      "= emissions attributable for reporting - excluded emissions by fuels - non-useful venting emissions - fugitive emissions - remaining NPNC (NPNC emissions - emissions excluded by fuel, non-useful venting, fugitive)",
    );
    await expect(panel.getByTestId("eafc-substitution")).toHaveText(
      "= 250000.0000 - 0 - 0 - 0 - 0",
    );
    await expect(panel.getByTestId("eafc-step1-result")).toHaveText(
      "= 250000.0000 tCO2e",
    );
    for (const title of [
      "Emissions attributable for reporting",
      "Excluded emissions by fuels",
      "Non-useful venting",
      "Fugitive emissions",
      "Remaining NPNC",
    ]) {
      await expect(panel.getByRole("heading", { name: title })).toBeVisible();
    }

    // Annual reports have no proration step and no unregulated products here
    await expect(panel.getByText(/Step 2/)).toHaveCount(0);
    await expect(
      panel.getByText(/Allocated to unregulated products/),
    ).toHaveCount(0);

    await analyzeAccessibility(page, "Compliance Summary - EAFC breakdown");
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "Report - Compliance Summary",
      variant: "EAFC breakdown expanded",
    });
  });

  test("Partial-year report (2024) shows the annual EAFC and the Apr-Dec proration", async ({
    page,
    happoScreenshot,
  }) => {
    // Fixture draft report: Compliance SFO - Obligation not met (2024, Apr-Dec production)
    const grid = new CurrentReportsPOM(page);
    await grid.gotoComplianceSummary(ReportIDs.OBLIGATION_NOT_MET_2024);

    const report = new CurrentReportPOM(page);
    await report.verifyComplianceSummary();

    const panel = await report.openEafcCalculationBreakdown();

    // Step 1: full-year value, before proration
    await expect(
      panel.getByRole("heading", {
        name: "Step 1: Calculate annual emissions attributable for compliance",
      }),
    ).toBeVisible();
    await expect(panel.getByTestId("eafc-substitution")).toHaveText(
      "= 11000.0000 - 0 - 0 - 0 - 0",
    );
    await expect(panel.getByTestId("eafc-step1-result")).toHaveText(
      "= 11000.0000 tCO2e",
    );

    // Step 2: each product's annual emissions × Apr-Dec production ÷ annual production
    await expect(
      panel.getByRole("heading", {
        name: "Step 2: Prorate to April 1 - December 31, 2024",
      }),
    ).toBeVisible();
    await expect(panel.getByTestId("eafc-step2-result")).toHaveText(
      "= 8100.0000 tCO2e",
    );
    await expect(
      panel
        .getByRole("row", {
          name: /BC-specific refinery complexity throughput/,
        })
        .getByRole("cell"),
    ).toHaveText(["10000.0000", "15,000 BCRCT", "20,000 BCRCT", "7500.0000"]);
    await expect(
      panel.getByRole("row", { name: /Cement equivalent/ }).getByRole("cell"),
    ).toHaveText([
      "1000.0000",
      "600 Tonne cement equivalent",
      "1,000 Tonne cement equivalent",
      "600.0000",
    ]);
    await expect(panel.getByTestId("eafc-step2-total")).toHaveText(
      "total 8100.0000",
    );

    await analyzeAccessibility(
      page,
      "Compliance Summary - EAFC breakdown (partial year)",
    );
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "Report - Compliance Summary",
      variant: "EAFC breakdown expanded - partial year",
    });
  });
});
