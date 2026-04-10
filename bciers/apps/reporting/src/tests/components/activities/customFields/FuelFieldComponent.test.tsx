import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, vi, it, beforeEach } from "vitest";
import { FuelFields } from "@reporting/src/app/components/activities/customFields/FuelFieldComponent";
import { actionHandler } from "@bciers/actions";
import FormBase from "@bciers/components/form/FormBase";
import { RJSFSchema, FieldProps } from "@rjsf/utils";

vi.mock("@bciers/actions", () => ({
  actionHandler: vi.fn(),
}));

const mockActionHandler = actionHandler as ReturnType<typeof vi.fn>;

const schema: RJSFSchema = {
  type: "object",
  properties: {
    fuelType: {
      type: "object",
      properties: {
        fuelName: {
          title: "Fuel Name",
          type: "string",
          enum: ["Natural Gas", "Field gas", "Diesel"],
        },
        fuelClassification: {
          title: "Fuel Classification",
          type: "string",
          readOnly: true,
        },
        fuelUnit: {
          title: "Fuel Unit",
          type: "string",
          readOnly: true,
        },
      },
    },
  },
};

const uiSchema = {
  fuelType: {
    "ui:field": "fuelType",
  },
};

const fields = {
  fuelType: (props: FieldProps) => <FuelFields {...props} />,
};

describe("FuelFields", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows help text below the fuel dropdown when a fuel with a description is selected", async () => {
    const user = userEvent.setup();
    mockActionHandler.mockResolvedValueOnce({
      name: "Natural Gas",
      classification: "Non-biomass",
      unit: "m3",
      description:
        'Natural Gas refers to purchased or marketable natural gas. For non-marketable natural gas or producer consumption, please use "Field gas".',
    });

    render(<FormBase schema={schema} uiSchema={uiSchema} fields={fields} />);

    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByRole("option", { name: "Natural Gas" }));

    expect(mockActionHandler).toHaveBeenCalledWith(
      `reporting/fuel?fuel_name=${encodeURIComponent("Natural Gas")}`,
      "GET",
      "",
    );

    await waitFor(() => {
      expect(
        screen.getByText(
          /Natural Gas refers to purchased or marketable natural gas/,
        ),
      ).toBeVisible();
    });
  });

  it("does not show help text when the selected fuel has no description", async () => {
    const user = userEvent.setup();
    mockActionHandler.mockResolvedValueOnce({
      name: "Diesel",
      classification: "Non-biomass",
      unit: "litres",
      description: null,
    });

    render(<FormBase schema={schema} uiSchema={uiSchema} fields={fields} />);

    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByRole("option", { name: "Diesel" }));

    await waitFor(() => {
      expect(
        screen.queryByText(
          /Natural Gas refers to purchased or marketable natural gas/,
        ),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(/Field gas refers to non-marketable natural gas/),
      ).not.toBeInTheDocument();
    });
  });
});
