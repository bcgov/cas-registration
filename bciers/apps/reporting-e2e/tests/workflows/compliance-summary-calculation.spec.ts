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

const EAFC_FORMULA =
  "= emissions attributable for reporting - excluded emissions by fuels - non-useful venting emissions - fugitive emissions - remaining NPNC (NPNC emissions - emissions excluded by fuel, non-useful venting, fugitive)";

const GSC_ACTIVITY = "General stationary combustion excluding line tracing";
const GSC_SOURCE_TYPE =
  "General stationary combustion of fuel or waste with production of useful energy";
const OIL_AND_GAS_ACTIVITY =
  "Non-compression and non-processing activities that are oil and gas extraction and gas processing activities";

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
    await expect(panel.getByTestId("eafc-formula")).toHaveText(EAFC_FORMULA);
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

  test("New entrant report (2025) shows the annual EAFC and the no-obligation note", async ({
    page,
    happoScreenshot,
  }) => {
    // Fixture draft report: Bullet LFO - Registered (2025, New Entrant Operation)
    const grid = new CurrentReportsPOM(page);
    await grid.gotoComplianceSummary(ReportIDs.NEW_ENTRANT);

    const report = new CurrentReportPOM(page);
    await report.verifyComplianceSummary();

    const panel = await report.openEafcCalculationBreakdown();

    // The field is 0, but the breakdown shows the annual value the operation would have had
    await expect(
      panel.getByRole("heading", {
        name: "Annual emissions attributable for compliance",
      }),
    ).toBeVisible();
    await expect(panel.getByTestId("eafc-substitution")).toHaveText(
      "= 11000.0000 - 0 - 0 - 0 - 0",
    );
    await expect(panel.getByTestId("eafc-step1-result")).toHaveText(
      "= 11000.0000 tCO2e",
    );
    await expect(panel.getByTestId("eafc-new-entrant-note")).toHaveText(
      "Note: New entrant operations have no compliance obligation, so emissions attributable for compliance = 0.",
    );

    // New entrants have no proration step
    await expect(panel.getByText(/Step \d/)).toHaveCount(0);
    await expect(panel.getByTestId("eafc-step2-result")).toHaveCount(0);

    await analyzeAccessibility(
      page,
      "Compliance Summary - EAFC breakdown (new entrant)",
    );
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "Report - Compliance Summary",
      variant: "EAFC breakdown expanded - new entrant",
    });
  });

  test("Report with emissions in every term (2024) shows each section and the unregulated products", async ({
    page,
    happoScreenshot,
  }) => {
    // Fixture draft report: Compliance SFO - No obligation or earned credits (2024, Apr-Dec production)
    const grid = new CurrentReportsPOM(page);
    await grid.gotoComplianceSummary(ReportIDs.NO_OBLIGATION_2024);

    const report = new CurrentReportPOM(page);
    await report.verifyComplianceSummary();

    const panel = await report.openEafcCalculationBreakdown();
    const section = (title: string) =>
      panel.locator("section").filter({
        has: page.getByRole("heading", { name: title, exact: true }),
      });
    const bodyRows = (title: string) => section(title).locator("tbody tr");

    // Step 1: every term is non-zero
    await expect(panel.getByTestId("eafc-formula")).toHaveText(
      `${EAFC_FORMULA} - emissions allocated to unregulated products`,
    );
    await expect(panel.getByTestId("eafc-substitution")).toHaveText(
      "= 27800.0000 - 3000.0000 - 1500.0000 - 800.0000 - 2500.0000 - 2000.0000",
    );
    await expect(panel.getByTestId("eafc-step1-result")).toHaveText(
      "= 18000.0000 tCO2e",
    );

    // Rows are sorted by activity, source type and fuel; tables with more than one row show a total
    const reportingRows = bodyRows("Emissions attributable for reporting");
    await expect(reportingRows).toHaveCount(5);
    const expectedReportingRows = [
      [GSC_ACTIVITY, GSC_SOURCE_TYPE, "Combustible Tall Oil", "3000.0000"],
      [GSC_ACTIVITY, GSC_SOURCE_TYPE, "Diesel", "20000.0000"],
      [
        OIL_AND_GAS_ACTIVITY,
        "Associated gas flaring",
        "Natural Gas",
        "2500.0000",
      ],
      [OIL_AND_GAS_ACTIVITY, "Dehydrator venting", "-", "1500.0000"],
      [OIL_AND_GAS_ACTIVITY, "Other fugitive sources", "-", "800.0000"],
    ];
    for (const [index, cells] of expectedReportingRows.entries()) {
      await expect(reportingRows.nth(index).getByRole("cell")).toHaveText(
        cells,
      );
    }
    await expect(
      section("Emissions attributable for reporting").locator("tfoot"),
    ).toHaveText("total 27800.0000");

    await expect(
      bodyRows("Excluded emissions by fuels").getByRole("cell"),
    ).toHaveText([
      GSC_ACTIVITY,
      GSC_SOURCE_TYPE,
      "Combustible Tall Oil",
      "3000.0000",
    ]);
    await expect(bodyRows("Non-useful venting").getByRole("cell")).toHaveText([
      OIL_AND_GAS_ACTIVITY,
      "Dehydrator venting",
      "-",
      "1500.0000",
    ]);
    await expect(bodyRows("Fugitive emissions").getByRole("cell")).toHaveText([
      OIL_AND_GAS_ACTIVITY,
      "Other fugitive sources",
      "-",
      "800.0000",
    ]);
    // Venting and fugitive NPNC emissions are already subtracted above, so only flaring remains
    await expect(bodyRows("Remaining NPNC").getByRole("cell")).toHaveText([
      OIL_AND_GAS_ACTIVITY,
      "Associated gas flaring",
      "Natural Gas",
      "2500.0000",
    ]);

    // Remaining NPNC is allocated to the unregulated product, so it is taken out of that line
    const unregulatedRows = bodyRows("Allocated to unregulated products");
    await expect(unregulatedRows).toHaveCount(2);
    await expect(unregulatedRows.nth(0).getByRole("cell")).toHaveText([
      "Oil and gas non-processing, non-compression",
      "4500.0000",
    ]);
    await expect(
      panel.getByTestId("eafc-npnc-adjustment").getByRole("cell"),
    ).toHaveText(["Less remaining NPNC", "-2500.0000"]);
    await expect(
      section("Allocated to unregulated products").locator("tfoot"),
    ).toHaveText("total 2000.0000");

    // Step 2: only the regulated product is prorated
    await expect(panel.getByTestId("eafc-step2-result")).toHaveText(
      "= 13500.0000 tCO2e",
    );
    await expect(
      panel.getByRole("row", { name: /Renewable diesel/ }).getByRole("cell"),
    ).toHaveText(["18000.0000", "7,500 N/A", "10,000 N/A", "13500.0000"]);
    // The unregulated product is only in its own section above, not in the proration table
    await expect(
      panel.getByRole("row", {
        name: /Oil and gas non-processing, non-compression/,
      }),
    ).toHaveCount(1);
    await expect(panel.getByTestId("eafc-step2-total")).toHaveText(
      "total 13500.0000",
    );

    await analyzeAccessibility(
      page,
      "Compliance Summary - EAFC breakdown (all terms)",
    );
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "Report - Compliance Summary",
      variant: "EAFC breakdown expanded - all terms",
    });
  });

  test("Opted-out report (2025) prorates to Jan-Mar", async ({
    page,
    happoScreenshot,
  }) => {
    // Fixture draft report: Bin LFO - Registered (2025, Opted-in Operation with final reporting year 2025)
    const grid = new CurrentReportsPOM(page);
    await grid.gotoComplianceSummary(ReportIDs.OPTED_OUT);

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
      "= 12000.0000 - 0 - 0 - 0 - 0",
    );
    await expect(panel.getByTestId("eafc-step1-result")).toHaveText(
      "= 12000.0000 tCO2e",
    );

    // Step 2: prorated by Jan-Mar production, not Apr-Dec
    await expect(
      panel.getByRole("heading", {
        name: "Step 2: Prorate to January 1 - March 31, 2025",
      }),
    ).toBeVisible();
    await expect(
      panel.getByText(
        /production for January 1 - March 31 ÷ annual production/,
      ),
    ).toBeVisible();
    await expect(panel.getByText(/April 1 - December 31/)).toHaveCount(0);
    await expect(
      panel.getByRole("columnheader", {
        name: "Production for January 1 - March 31",
      }),
    ).toBeVisible();
    await expect(
      panel.getByRole("row", { name: /Cement equivalent/ }).getByRole("cell"),
    ).toHaveText([
      "12000.0000",
      "1,000 Tonne cement equivalent",
      "4,000 Tonne cement equivalent",
      "3000.0000",
    ]);
    await expect(panel.getByTestId("eafc-step2-result")).toHaveText(
      "= 3000.0000 tCO2e",
    );
    await expect(panel.getByTestId("eafc-step2-total")).toHaveText(
      "total 3000.0000",
    );

    await analyzeAccessibility(
      page,
      "Compliance Summary - EAFC breakdown (opted out, Jan-Mar)",
    );
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "Report - Compliance Summary",
      variant: "EAFC breakdown expanded - opted out",
    });
  });
});
