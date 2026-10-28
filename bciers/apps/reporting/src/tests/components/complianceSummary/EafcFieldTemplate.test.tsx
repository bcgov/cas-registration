import { render, screen } from "@testing-library/react";
import type { FieldTemplateProps } from "@rjsf/utils";
import EafcFieldTemplate from "@reporting/src/app/components/complianceSummary/EafcFieldTemplate";

const baseProps = {
  id: "root_emissions_attributable_for_compliance",
  label: "Emissions attributable for compliance",
  children: <input data-testid="field-input" />,
  uiSchema: { "ui:options": { displayUnit: "tCO2e" } },
  classNames: "",
  rawErrors: undefined,
  required: false,
  help: undefined,
  description: undefined,
  schema: {},
  disabled: false,
  readonly: false,
  hideError: false,
  onChange: vi.fn(),
} as unknown as FieldTemplateProps;

const formContext = {
  eafc_totals: {
    attributable_for_reporting: "1000",
    excluded_by_fuels: "0",
    non_useful_venting: "0",
    fugitive: "0",
    remaining_npnc: "0",
    allocated_to_unregulated_products: "0",
    annual_eafc: "1000",
    attributable_for_reporting_rows: [],
    excluded_by_fuels_rows: [],
    non_useful_venting_rows: [],
    fugitive_rows: [],
    remaining_npnc_rows: [],
    unregulated_product_rows: [],
  },
  production_period: "annual",
  is_new_entrant: false,
  products: [],
  emissions_attributable_for_compliance: "1000",
  reporting_year: 2025,
};

const renderTemplate = (context: Record<string, unknown>) =>
  render(
    <EafcFieldTemplate
      {...baseProps}
      registry={{ formContext: context } as FieldTemplateProps["registry"]}
    />,
  );

describe("EafcFieldTemplate", () => {
  it("renders the base field with its label, input and unit", () => {
    renderTemplate(formContext);

    expect(
      screen.getByText("Emissions attributable for compliance", {
        selector: "label",
      }),
    ).toBeVisible();
    expect(screen.getByTestId("field-input")).toBeVisible();
    expect(screen.getByText("tCO2e")).toBeVisible();
  });

  it("renders the calculation breakdown below the field", () => {
    renderTemplate(formContext);

    expect(
      screen.getByRole("button", { name: "How was this calculated?" }),
    ).toBeVisible();
  });

  it("renders nothing extra when eafc_totals is missing", () => {
    const { eafc_totals: _omitted, ...withoutTotals } = formContext;
    renderTemplate(withoutTotals);

    expect(screen.getByTestId("field-input")).toBeVisible();
    expect(
      screen.queryByRole("button", { name: "How was this calculated?" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("eafc-calculation-breakdown"),
    ).not.toBeInTheDocument();
  });
});
