import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import FuelAmountFieldTemplate from "./FuelAmountFieldTemplate";
import type { FieldTemplateProps } from "@rjsf/utils";

vi.mock("@bciers/components/icons/AlertIcon", () => ({
  default: () => <div data-testid="alert-icon" />,
}));

const defaultProps: FieldTemplateProps = {
  id: "root_fuel_0_annualFuelAmount",
  label: "Annual Fuel Amount",
  children: <input data-testid="field-input" />,
  uiSchema: {},
  registry: { formContext: {} } as any,
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
};

const renderWidget = (overrides: Partial<FieldTemplateProps> = {}) => {
  const mergedProps = { ...defaultProps, ...overrides };
  return render(<FuelAmountFieldTemplate {...mergedProps} />);
};

describe("FuelAmountFieldTemplate", () => {
  it("renders field label, input, and required indicator when required is true", () => {
    renderWidget({ required: true });

    expect(screen.getByText(/Annual Fuel Amount */)).toBeVisible();
    expect(screen.getByTestId("field-input")).toBeVisible();
  });

  it("renders an asterisk after the label when required is true", () => {
    renderWidget({ required: true });

    const label = screen.getByText("Annual Fuel Amount", { exact: false });
    expect(label.textContent).toBe("Annual Fuel Amount*");
  });

  it("does not render an asterisk after the label when required is false", () => {
    renderWidget({ required: false });

    const label = screen.getByText("Annual Fuel Amount", { exact: false });
    expect(label.textContent).toBe("Annual Fuel Amount");
  });

  it("returns null when ui:widget is set to hidden", () => {
    const { container } = renderWidget({
      uiSchema: { "ui:widget": "hidden" },
    });

    expect(container.firstChild).toBeNull();
    expect(screen.queryByText(/Annual Fuel Amount/)).not.toBeInTheDocument();
  });

  it("does not render label when ui:options.label is false", () => {
    renderWidget({
      uiSchema: { "ui:options": { label: false } },
    });

    expect(screen.queryByText("Annual Fuel Amount")).not.toBeInTheDocument();
    expect(screen.getByTestId("field-input")).toBeVisible();
  });

  it("displays fuel unit next to input when fuelType.fuelUnit exists in form context", () => {
    renderWidget({
      id: "root_fuels_0_annualFuelAmount",
      registry: {
        formContext: {
          activityFormData: {
            fuels: [
              {
                fuelType: {
                  fuelUnit: "snacks",
                },
              },
            ],
          },
        },
      },
    });

    expect(screen.getByText("Annual Fuel Amount")).toBeVisible();
    expect(screen.getByText("snacks")).toBeVisible();
  });

  it("handles nested path segments correctly to resolve fuel unit", () => {
    renderWidget({
      id: "root_mobile_fuels_1_q3FuelAmount",
      registry: {
        formContext: {
          activityFormData: {
            mobile: {
              fuels: [
                {},
                {
                  fuelType: {
                    fuelUnit: "litres",
                  },
                },
              ],
            },
          },
        },
      },
    });

    expect(screen.getByText("Annual Fuel Amount")).toBeVisible();
    expect(screen.getByText("litres")).toBeVisible();
  });

  it("renders error state with alert icon and error message when rawErrors are present", () => {
    renderWidget({ rawErrors: ["This field is required"] });

    expect(screen.getByTestId("alert-icon")).toBeVisible();
    expect(screen.getByText("This field is required")).toBeVisible();
    expect(screen.getByRole("alert")).toBeVisible();
  });

  it("applies full width class when ui:options.inline is true", () => {
    const { container } = renderWidget({
      uiSchema: { "ui:options": { inline: true } },
    });

    const inputWrapper = container.querySelector(".lg\\:w-full");
    expect(inputWrapper).toBeVisible();
  });

  it("renders description and help text when provided", () => {
    renderWidget({
      description: (
        <span data-testid="field-description">Field description</span>
      ),
      help: <span data-testid="field-help">Help text</span>,
    });

    expect(screen.getByTestId("field-description")).toBeVisible();
    expect(screen.getByTestId("field-help")).toBeVisible();
    expect(screen.getByText(/Field description/)).toBeVisible();
  });

  it("displays static unit text when ui:options.displayUnit is set", () => {
    renderWidget({
      uiSchema: { "ui:options": { displayUnit: "tonnes" } },
    });

    expect(screen.getByText("tonnes")).toBeVisible();
  });

  it("does not modify label when no fuel unit is available in form context", () => {
    renderWidget({
      id: "root_fuels_0_annualFuelAmount",
      registry: {
        formContext: {
          activityFormData: {
            fuels: [{}],
          },
        },
      },
    });

    expect(screen.getByText(/Annual Fuel Amount */)).toBeVisible();
  });

  it("handles invalid parent paths gracefully without errors", () => {
    renderWidget({
      id: "root_invalid_path_fieldName",
      registry: {
        formContext: {
          activityFormData: {},
        },
      },
    });

    expect(screen.getByText(/Annual Fuel Amount */)).toBeVisible();
  });

  it("uses custom label class names when provided in ui options", () => {
    const { container } = renderWidget({
      uiSchema: { "ui:options": { labelClassNames: "custom-label-class" } },
    });

    const labelWrapper = container.querySelector(".custom-label-class");
    expect(labelWrapper).toBeVisible();
  });
});
