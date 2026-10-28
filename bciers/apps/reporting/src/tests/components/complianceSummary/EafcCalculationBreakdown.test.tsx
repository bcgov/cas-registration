import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EafcCalculationBreakdown from "@reporting/src/app/components/complianceSummary/EafcCalculationBreakdown";
import {
  ComplianceSummaryFormProduct,
  EafcTotals,
} from "@reporting/src/app/components/complianceSummary/types";

const eafcTotals: EafcTotals = {
  attributable_for_reporting: "1000.5",
  excluded_by_fuels: "100.25",
  non_useful_venting: "50",
  fugitive: "25",
  remaining_npnc: "10",
  allocated_to_unregulated_products: "0",
  annual_eafc: "815.25",
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
  eafcTotals,
  productionPeriod: "annual" as const,
  isNewEntrant: false,
  products,
  emissionsAttributableForCompliance: "815.25",
  reportingYear: 2025,
};

const renderBreakdown = (
  overrides: Partial<
    React.ComponentProps<typeof EafcCalculationBreakdown>
  > = {},
) => render(<EafcCalculationBreakdown {...defaultProps} {...overrides} />);

const toggleButton = () =>
  screen.getByRole("button", { name: "How was this calculated?" });

const expand = async () => userEvent.click(toggleButton());

const getSection = (title: string) =>
  screen
    .getByRole("heading", { name: title })
    .closest("section") as HTMLElement;

describe("EafcCalculationBreakdown", () => {
  it("is collapsed by default", () => {
    renderBreakdown();

    expect(toggleButton()).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByTestId("eafc-calculation-breakdown")).not.toBeVisible();
  });

  it("links the toggle button to the panel", () => {
    renderBreakdown();

    expect(toggleButton()).toHaveAttribute(
      "aria-controls",
      screen.getByTestId("eafc-calculation-breakdown").id,
    );
  });

  it("expands and collapses on click", async () => {
    renderBreakdown();

    await expand();
    expect(toggleButton()).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByTestId("eafc-calculation-breakdown")).toBeVisible();

    await userEvent.click(toggleButton());
    expect(toggleButton()).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByTestId("eafc-calculation-breakdown")).not.toBeVisible();
  });

  it("shows an expand arrow when collapsed and a collapse arrow when expanded", async () => {
    renderBreakdown();

    expect(screen.getByTestId("eafc-toggle-expand-icon")).toBeInTheDocument();
    expect(
      screen.queryByTestId("eafc-toggle-collapse-icon"),
    ).not.toBeInTheDocument();

    await expand();
    expect(screen.getByTestId("eafc-toggle-collapse-icon")).toBeInTheDocument();
    expect(
      screen.queryByTestId("eafc-toggle-expand-icon"),
    ).not.toBeInTheDocument();
  });

  it("expands with the keyboard", async () => {
    renderBreakdown();

    toggleButton().focus();
    await userEvent.keyboard("{Enter}");

    expect(toggleButton()).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByTestId("eafc-calculation-breakdown")).toBeVisible();
  });

  it("renders the annual formula, substitution and final result without Step 2", async () => {
    renderBreakdown({ emissionsAttributableForCompliance: "815.2501" });
    await expand();

    expect(
      screen.getByRole("heading", {
        name: "Emissions attributable for compliance",
      }),
    ).toBeVisible();
    expect(screen.getByTestId("eafc-formula")).toHaveTextContent(
      "= emissions attributable for reporting - excluded emissions by fuels - non-useful venting emissions - fugitive emissions - remaining NPNC (NPNC emissions - emissions excluded by fuel, non-useful venting, fugitive)",
    );
    expect(screen.getByTestId("eafc-substitution")).toHaveTextContent(
      "= 1000.5000 - 100.2500 - 50.0000 - 25.0000 - 10.0000",
    );
    // Annual uses the authoritative backend value, not annual_eafc
    expect(screen.getByTestId("eafc-step1-result")).toHaveTextContent(
      "= 815.2501 tCO2e",
    );
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
    ).toEqual(["Oil and gas", "Flaring stacks", "Natural Gas", "1000.5000"]);
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

    expect(screen.getByTestId("eafc-formula")).not.toHaveTextContent(
      /unregulated products/,
    );
    expect(
      screen.queryByRole("heading", {
        name: "Allocated to unregulated products",
      }),
    ).not.toBeInTheDocument();
  });

  it("shows the unregulated products term when it is greater than 0", async () => {
    renderBreakdown({
      eafcTotals: {
        ...eafcTotals,
        allocated_to_unregulated_products: "15.5",
        annual_eafc: "799.75",
        // 25.5 allocated, less the 10 of remaining NPNC subtracted on its own line
        unregulated_product_rows: [
          { product_name: "Product A", allocated_emissions: "20" },
          { product_name: "Product B", allocated_emissions: "5.5" },
        ],
      },
    });
    await expand();

    expect(screen.getByTestId("eafc-formula")).toHaveTextContent(
      / - emissions allocated to unregulated products$/,
    );
    expect(screen.getByTestId("eafc-substitution")).toHaveTextContent(
      "= 1000.5000 - 100.2500 - 50.0000 - 25.0000 - 10.0000 - 15.5000",
    );

    const unregulated = within(getSection("Allocated to unregulated products"));
    const rows = unregulated.getAllByRole("row");
    expect(
      within(rows[1])
        .getAllByRole("cell")
        .map((c) => c.textContent),
    ).toEqual(["Product A", "20.0000"]);
    expect(
      within(unregulated.getByTestId("eafc-npnc-adjustment"))
        .getAllByRole("cell")
        .map((c) => c.textContent),
    ).toEqual(["Less remaining NPNC", "-10.0000"]);
    expect(unregulated.getByText("total 15.5000")).toBeVisible();
  });

  it("does not show the NPNC adjustment when there is no remaining NPNC", async () => {
    renderBreakdown({
      eafcTotals: {
        ...eafcTotals,
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
    expect(
      unregulated.queryByTestId("eafc-npnc-adjustment"),
    ).not.toBeInTheDocument();
    // A single row needs no total
    expect(unregulated.queryByText(/total/)).not.toBeInTheDocument();
  });

  it("formats emissions to 4 decimal places without thousands separators", async () => {
    renderBreakdown({
      eafcTotals: { ...eafcTotals, attributable_for_reporting: "1234.567891" },
    });
    await expand();

    expect(screen.getByTestId("eafc-substitution")).toHaveTextContent(
      /^= 1234\.5679 - /,
    );
  });

  it.each([
    ["0.00001", "0"],
    ["-0.00001", "0"],
    ["not a number", "0"],
    ["12", "12.0000"],
  ])("formats %s as %s", async (value, expected) => {
    renderBreakdown({
      eafcTotals: { ...eafcTotals, attributable_for_reporting: value },
    });
    await expand();

    expect(screen.getByTestId("eafc-substitution")).toHaveTextContent(
      new RegExp(`^= ${expected} - `),
    );
  });

  it.each([
    ["apr_dec", "April 1 - December 31", 2024, ["750 tonnes", "0 tonnes"]],
    ["jan_mar", "January 1 - March 31", 2025, ["250 tonnes", "0 tonnes"]],
  ] as const)(
    "renders Step 1 as Annual EAFC and the Step 2 proration for %s",
    async (productionPeriod, periodLabel, reportingYear, periodProduction) => {
      renderBreakdown({
        productionPeriod,
        reportingYear,
        emissionsAttributableForCompliance: "611.4375",
      });
      await expand();

      expect(
        screen.getByRole("heading", {
          name: "Step 1: Calculate annual emissions attributable for compliance",
        }),
      ).toBeVisible();
      expect(screen.getByTestId("eafc-step1-result")).toHaveTextContent(
        "= 815.2500 tCO2e",
      );
      expect(
        screen.getByRole("heading", {
          name: `Step 2: Prorate to ${periodLabel}, ${reportingYear}`,
        }),
      ).toBeVisible();
      expect(
        screen.getByRole("columnheader", {
          name: `Production for ${periodLabel}`,
        }),
      ).toBeVisible();

      expect(screen.getByTestId("eafc-step2-result")).toHaveTextContent(
        "= 611.4375 tCO2e",
      );

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
        periodProduction[0],
        "1,000 tonnes",
        "611.4375",
      ]);

      // 0 annual production shows a prorated EAFC of 0
      const lime = within(rows[2]).getAllByRole("cell");
      expect(lime.map((c) => c.textContent)).toEqual([
        "0",
        periodProduction[1],
        "0 tonnes",
        "0",
      ]);

      expect(screen.getByTestId("eafc-step2-total")).toHaveTextContent(
        "total 611.4375",
      );
    },
  );

  it("shows the new entrant note instead of Step 2", async () => {
    renderBreakdown({
      isNewEntrant: true,
      productionPeriod: "apr_dec",
      emissionsAttributableForCompliance: "0",
    });
    await expand();

    expect(
      screen.getByRole("heading", {
        name: "Annual emissions attributable for compliance",
      }),
    ).toBeVisible();
    expect(screen.getByTestId("eafc-step1-result")).toHaveTextContent(
      "= 815.2500 tCO2e",
    );
    expect(screen.getByTestId("eafc-new-entrant-note")).toHaveTextContent(
      "New entrant operations have no compliance obligation, so emissions attributable for compliance = 0.",
    );
    expect(screen.queryByText(/Step 2/)).not.toBeInTheDocument();
  });
});
