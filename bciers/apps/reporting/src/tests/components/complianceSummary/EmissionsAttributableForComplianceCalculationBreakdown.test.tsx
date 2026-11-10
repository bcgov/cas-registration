import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EmissionsAttributableForComplianceCalculationBreakdown from "@reporting/src/app/components/complianceSummary/EmissionsAttributableForComplianceCalculationBreakdown";
import {
  ComplianceSummaryFormProduct,
  EmissionsAttributableForComplianceTotals,
} from "@reporting/src/app/components/complianceSummary/types";

const emissionsAttributableForComplianceTotals: EmissionsAttributableForComplianceTotals =
  {
    attributable_for_reporting: "1000.5",
    excluded_by_fuels: "100.25",
    non_useful_venting: "50",
    fugitive: "25",
    remaining_npnc: "10",
    allocated_to_unregulated_products: "0",
    annual_emissions_attributable_for_compliance: "815.25",
    attributable_for_reporting_rows: [
      {
        activity: "Oil and gas",
        source_type: "Flaring stacks",
        fuel_name: "Natural Gas",
        emissions: "1000.5",
      },
    ],
    excluded_by_fuels_rows: [
      {
        activity: "General stationary combustion",
        source_type: "Combustion of fuel",
        fuel_name: "Wood waste",
        emissions: "100.25",
      },
    ],
    non_useful_venting_rows: [],
    fugitive_rows: [
      {
        activity: "Oil and gas (compression & processing)",
        source_type: "Equipment leaks",
        emissions: "20",
      },
      {
        activity: "Oil and gas (other than compression & processing)",
        source_type: "Other fugitive sources",
        emissions: "5",
      },
    ],
    remaining_npnc_rows: [
      {
        activity: "GSC (other than compression & processing)",
        source_type: "GSC of fuel or waste",
        fuel_name: "Diesel",
        emissions: "10",
      },
    ],
    unregulated_products_excluded_by_fuels: "0",
    unregulated_products_non_useful_venting: "0",
    unregulated_products_fugitive: "0",
    unregulated_product_rows: [],
  };

const products: ComplianceSummaryFormProduct[] = [
  {
    name: "Cement",
    unit: "tonnes",
    annual_production: "1000",
    apr_dec_production: "750",
    jan_mar_production: "250",
    emission_intensity: "0.8",
    allocated_industrial_process_emissions: "0",
    allocated_compliance_emissions: "611.4375",
    allocated_for_compliance_annual: "815.25",
    reduction_factor: "0.65",
    tightening_rate: "0.01",
  },
  {
    name: "Lime",
    unit: "tonnes",
    annual_production: "0",
    apr_dec_production: "0",
    jan_mar_production: "0",
    emission_intensity: "0",
    allocated_industrial_process_emissions: "0",
    allocated_compliance_emissions: "0",
    allocated_for_compliance_annual: "0",
    reduction_factor: "0.65",
    tightening_rate: "0.01",
  },
];

const defaultProps = {
  emissionsAttributableForComplianceTotals,
  productionPeriod: "annual" as const,
  isNewEntrant: false,
  products,
  emissionsAttributableForCompliance: "815.25",
  reportingYear: 2025,
};

const renderBreakdown = (
  overrides: Partial<
    React.ComponentProps<
      typeof EmissionsAttributableForComplianceCalculationBreakdown
    >
  > = {},
) =>
  render(
    <EmissionsAttributableForComplianceCalculationBreakdown
      {...defaultProps}
      {...overrides}
    />,
  );

const toggleButton = () =>
  screen.getByRole("button", { name: "How was this calculated?" });

const expand = async () => userEvent.click(toggleButton());

const getSection = (title: string) =>
  screen
    .getByRole("heading", { name: title })
    .closest("section") as HTMLElement;

describe("EmissionsAttributableForComplianceCalculationBreakdown", () => {
  it("is collapsed by default", () => {
    renderBreakdown();

    expect(toggleButton()).toHaveAttribute("aria-expanded", "false");
    expect(
      screen.getByTestId(
        "emissions-attributable-for-compliance-calculation-breakdown",
      ),
    ).not.toBeVisible();
  });

  it("links the toggle button to the panel", () => {
    renderBreakdown();

    expect(toggleButton()).toHaveAttribute(
      "aria-controls",
      screen.getByTestId(
        "emissions-attributable-for-compliance-calculation-breakdown",
      ).id,
    );
  });

  it("expands and collapses on click", async () => {
    renderBreakdown();

    await expand();
    expect(toggleButton()).toHaveAttribute("aria-expanded", "true");
    expect(
      screen.getByTestId(
        "emissions-attributable-for-compliance-calculation-breakdown",
      ),
    ).toBeVisible();

    await userEvent.click(toggleButton());
    expect(toggleButton()).toHaveAttribute("aria-expanded", "false");
    expect(
      screen.getByTestId(
        "emissions-attributable-for-compliance-calculation-breakdown",
      ),
    ).not.toBeVisible();
  });

  it("shows an expand arrow when collapsed and a collapse arrow when expanded", async () => {
    renderBreakdown();

    expect(
      screen.getByTestId(
        "emissions-attributable-for-compliance-toggle-expand-icon",
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId(
        "emissions-attributable-for-compliance-toggle-collapse-icon",
      ),
    ).not.toBeInTheDocument();

    await expand();
    expect(
      screen.getByTestId(
        "emissions-attributable-for-compliance-toggle-collapse-icon",
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId(
        "emissions-attributable-for-compliance-toggle-expand-icon",
      ),
    ).not.toBeInTheDocument();
  });

  it("expands with the keyboard", async () => {
    renderBreakdown();

    toggleButton().focus();
    await userEvent.keyboard("{Enter}");

    expect(toggleButton()).toHaveAttribute("aria-expanded", "true");
    expect(
      screen.getByTestId(
        "emissions-attributable-for-compliance-calculation-breakdown",
      ),
    ).toBeVisible();
  });

  it("renders the annual formula, substitution and final result without Step 2", async () => {
    renderBreakdown({ emissionsAttributableForCompliance: "815.2501" });
    await expand();

    expect(
      screen.getByRole("heading", {
        name: "Emissions attributable for compliance",
      }),
    ).toBeVisible();
    expect(
      screen.getByTestId("emissions-attributable-for-compliance-formula"),
    ).toHaveTextContent(
      "= emissions attributable for reporting - excluded emissions by fuels - non-useful venting emissions - fugitive emissions - remaining NPNC (NPNC emissions - emissions excluded by fuel, non-useful venting, fugitive)",
    );
    expect(
      screen.getByTestId("emissions-attributable-for-compliance-substitution"),
    ).toHaveTextContent(
      "= 1,000.5000 - 100.2500 - 50.0000 - 25.0000 - 10.0000",
    );
    // Annual uses the authoritative backend value, not annual_emissions_attributable_for_compliance
    expect(
      screen.getByTestId("emissions-attributable-for-compliance-step1-result"),
    ).toHaveTextContent("= 815.2501 tCO2e");
    expect(screen.queryByText(/Step 2/)).not.toBeInTheDocument();
  });

  it("renders a table of emissions for each term", async () => {
    renderBreakdown();
    await expand();

    const titles = [
      "Emissions attributable for reporting",
      "Excluded emissions by fuels",
      "Non-useful venting",
      "Fugitive emissions",
      "Remaining NPNC",
    ];
    titles.forEach((title) =>
      expect(screen.getByRole("heading", { name: title })).toBeVisible(),
    );

    const reporting = within(
      getSection("Emissions attributable for reporting"),
    );
    expect(
      reporting.getAllByRole("columnheader").map((c) => c.textContent),
    ).toEqual(["Activity", "Source type", "Fuel name", "Emissions"]);
    const [, row] = reporting.getAllByRole("row");
    expect(
      within(row)
        .getAllByRole("cell")
        .map((c) => c.textContent),
    ).toEqual(["Oil and gas", "Flaring stacks", "Natural Gas", "1,000.5000"]);
  });

  it("shows dashes for a term with no emissions", async () => {
    renderBreakdown();
    await expand();

    const venting = within(getSection("Non-useful venting"));
    const [, row] = venting.getAllByRole("row");
    expect(
      within(row)
        .getAllByRole("cell")
        .map((c) => c.textContent),
    ).toEqual(["-", "-", "-", "-"]);
  });

  it("shows a dash when a row has no fuel", async () => {
    renderBreakdown();
    await expand();

    const fugitive = within(getSection("Fugitive emissions"));
    const rows = fugitive.getAllByRole("row");
    expect(within(rows[1]).getAllByRole("cell")[2]).toHaveTextContent("-");
  });

  it("shows a total only when a term has more than one row", async () => {
    renderBreakdown();
    await expand();

    expect(
      within(getSection("Fugitive emissions")).getByText("total 25.0000"),
    ).toBeVisible();
    expect(
      within(getSection("Emissions attributable for reporting")).queryByText(
        /total/,
      ),
    ).not.toBeInTheDocument();
  });

  it("hides the unregulated products term when it is 0", async () => {
    renderBreakdown();
    await expand();

    expect(
      screen.getByTestId("emissions-attributable-for-compliance-formula"),
    ).not.toHaveTextContent(/unregulated products/);
    expect(
      screen.queryByRole("heading", {
        name: "Allocated to unregulated products",
      }),
    ).not.toBeInTheDocument();
  });

  it("shows the unregulated products term when it is greater than 0", async () => {
    renderBreakdown({
      emissionsAttributableForComplianceTotals: {
        ...emissionsAttributableForComplianceTotals,
        allocated_to_unregulated_products: "15.5",
        annual_emissions_attributable_for_compliance: "799.75",
        // 25.5 allocated, less the 10 of remaining NPNC subtracted on its own line
        unregulated_product_rows: [
          { product_name: "Product A", allocated_emissions: "20" },
          { product_name: "Product B", allocated_emissions: "5.5" },
        ],
      },
    });
    await expand();

    expect(
      screen.getByTestId("emissions-attributable-for-compliance-formula"),
    ).toHaveTextContent(/ - emissions allocated to unregulated products$/);
    expect(
      screen.getByTestId("emissions-attributable-for-compliance-substitution"),
    ).toHaveTextContent(
      "= 1,000.5000 - 100.2500 - 50.0000 - 25.0000 - 10.0000 - 15.5000",
    );

    const unregulated = within(getSection("Allocated to unregulated products"));
    const rows = unregulated.getAllByRole("row");
    expect(
      within(rows[1])
        .getAllByRole("cell")
        .map((c) => c.textContent),
    ).toEqual(["Product A", "20.0000"]);
    expect(
      within(
        unregulated.getByTestId(
          "emissions-attributable-for-compliance-npnc-adjustment",
        ),
      )
        .getAllByRole("cell")
        .map((c) => c.textContent),
    ).toEqual(["Less remaining NPNC", "-10.0000"]);
    expect(unregulated.getByText("total 15.5000")).toBeVisible();
  });

  it("shows the gross product allocations less each term allocated to unregulated products", async () => {
    renderBreakdown({
      emissionsAttributableForComplianceTotals: {
        ...emissionsAttributableForComplianceTotals,
        // 40 allocated, less 3 excluded by fuels, 1.5 non-useful venting, 5 fugitive and 10 remaining NPNC
        allocated_to_unregulated_products: "20.5",
        unregulated_products_excluded_by_fuels: "3",
        unregulated_products_non_useful_venting: "1.5",
        unregulated_products_fugitive: "5",
        unregulated_product_rows: [
          { product_name: "Product A", allocated_emissions: "40" },
        ],
      },
    });
    await expand();

    const unregulated = within(getSection("Allocated to unregulated products"));
    expect(
      unregulated
        .getAllByRole("row")
        .slice(1, -1)
        .map((row) =>
          within(row)
            .getAllByRole("cell")
            .map((c) => c.textContent),
        ),
    ).toEqual([
      ["Product A", "40.0000"],
      [
        "Less excluded emissions by fuels allocated to unregulated products",
        "-3.0000",
      ],
      ["Less non-useful venting allocated to unregulated products", "-1.5000"],
      ["Less fugitive emissions allocated to unregulated products", "-5.0000"],
      ["Less remaining NPNC", "-10.0000"],
    ]);
    expect(unregulated.getByText("total 20.5000")).toBeVisible();
  });

  it("does not show deductions that are 0", async () => {
    renderBreakdown({
      emissionsAttributableForComplianceTotals: {
        ...emissionsAttributableForComplianceTotals,
        remaining_npnc: "0",
        remaining_npnc_rows: [],
        allocated_to_unregulated_products: "15.5",
        unregulated_product_rows: [
          { product_name: "Product A", allocated_emissions: "15.5" },
        ],
      },
    });
    await expand();

    const unregulated = within(getSection("Allocated to unregulated products"));
    expect(unregulated.queryAllByText(/^Less /)).toHaveLength(0);
    // A single row needs no total
    expect(unregulated.queryByText(/total/)).not.toBeInTheDocument();
  });

  it("formats emissions to 4 decimal places with thousands separators", async () => {
    renderBreakdown({
      emissionsAttributableForComplianceTotals: {
        ...emissionsAttributableForComplianceTotals,
        attributable_for_reporting: "1234.567891",
      },
    });
    await expand();

    expect(
      screen.getByTestId("emissions-attributable-for-compliance-substitution"),
    ).toHaveTextContent(/^= 1,234\.5679 - /);
  });

  it.each([
    ["0.00001", "0"],
    ["-0.00001", "0"],
    ["not a number", "0"],
    ["12", "12.0000"],
  ])("formats %s as %s", async (value, expected) => {
    renderBreakdown({
      emissionsAttributableForComplianceTotals: {
        ...emissionsAttributableForComplianceTotals,
        attributable_for_reporting: value,
      },
    });
    await expand();

    expect(
      screen.getByTestId("emissions-attributable-for-compliance-substitution"),
    ).toHaveTextContent(new RegExp(`^= ${expected} - `));
  });

  it.each([
    [
      "apr_dec",
      "April 1 - December 31",
      2024,
      ["750", "0"],
      "= (815.2500 / 1,000) × 750 + (0 / 0) × 0",
    ],
    [
      "jan_mar",
      "January 1 - March 31",
      2025,
      ["250", "0"],
      "= (815.2500 / 1,000) × 250 + (0 / 0) × 0",
    ],
  ] as const)(
    "renders Annual EAFC and the proration for %s",
    async (
      productionPeriod,
      periodLabel,
      reportingYear,
      periodProduction,
      expectedSubstitution,
    ) => {
      renderBreakdown({
        productionPeriod,
        reportingYear,
        emissionsAttributableForCompliance: "611.4375",
      });
      await expand();

      expect(
        screen.getByRole("heading", {
          name: "Annual emissions attributable for compliance",
        }),
      ).toBeVisible();
      expect(
        screen.getByTestId(
          "emissions-attributable-for-compliance-step1-result",
        ),
      ).toHaveTextContent("= 815.2500 tCO2e");
      expect(
        screen.getByRole("heading", {
          name: `Prorate to ${periodLabel}, ${reportingYear}`,
        }),
      ).toBeVisible();
      expect(
        screen.getByRole("columnheader", {
          name: `Production for ${periodLabel}`,
        }),
      ).toBeVisible();

      expect(
        screen.getByTestId(
          "emissions-attributable-for-compliance-step2-substitution",
        ),
      ).toHaveTextContent(expectedSubstitution);
      expect(
        screen.getByTestId(
          "emissions-attributable-for-compliance-step2-result",
        ),
      ).toHaveTextContent("= 611.4375 tCO2e");

      const prorationTable = screen.getAllByRole("table").find((table) =>
        within(table).queryByRole("columnheader", {
          name: "Prorated emissions",
        }),
      ) as HTMLElement;
      const rows = within(prorationTable).getAllByRole("row");
      // header, 2 products, totals
      expect(rows).toHaveLength(4);

      const cement = within(rows[1]).getAllByRole("cell");
      expect(within(rows[1]).getByRole("rowheader")).toHaveTextContent(
        "Cement",
      );
      expect(cement.map((c) => c.textContent)).toEqual([
        "815.2500",
        "1,000",
        periodProduction[0],
        "611.4375",
      ]);

      // 0 annual production shows a prorated EAFC of 0
      const lime = within(rows[2]).getAllByRole("cell");
      expect(lime.map((c) => c.textContent)).toEqual([
        "0",
        "0",
        periodProduction[1],
        "0",
      ]);

      expect(
        screen.getByTestId("emissions-attributable-for-compliance-step2-total"),
      ).toHaveTextContent("total 611.4375");
    },
  );

  it("renders the proration substitution for a single product", async () => {
    renderBreakdown({
      productionPeriod: "apr_dec",
      reportingYear: 2024,
      products: [
        {
          name: "Renewable diesel",
          unit: "litres",
          annual_production: "10000",
          apr_dec_production: "7500",
          jan_mar_production: "0",
          emission_intensity: "0.5",
          allocated_industrial_process_emissions: "0",
          allocated_compliance_emissions: "13500",
          allocated_for_compliance_annual: "18000",
          reduction_factor: "0.65",
          tightening_rate: "0.01",
        },
      ],
      emissionsAttributableForCompliance: "13500",
    });
    await expand();

    expect(
      screen.getByTestId(
        "emissions-attributable-for-compliance-step2-substitution",
      ),
    ).toHaveTextContent("= (18,000.0000 / 10,000) × 7,500");
    expect(
      screen.getByTestId("emissions-attributable-for-compliance-step2-result"),
    ).toHaveTextContent("= 13,500.0000 tCO2e");
  });

  it("shows only the new entrant note without the annual calculation or proration", async () => {
    renderBreakdown({
      isNewEntrant: true,
      productionPeriod: "apr_dec",
      emissionsAttributableForCompliance: "0",
    });
    await expand();

    expect(
      screen.getByTestId(
        "emissions-attributable-for-compliance-new-entrant-note",
      ),
    ).toHaveTextContent(
      "New entrant operations have no compliance obligation, so emissions attributable for compliance = 0.",
    );
    expect(
      screen.queryByTestId("emissions-attributable-for-compliance-formula"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId(
        "emissions-attributable-for-compliance-substitution",
      ),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId(
        "emissions-attributable-for-compliance-step1-result",
      ),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/Prorate to/)).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", {
        name: /emissions attributable for compliance/i,
      }),
    ).not.toBeInTheDocument();
  });
});
