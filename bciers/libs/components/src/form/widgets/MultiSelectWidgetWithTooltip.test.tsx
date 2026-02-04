import { userEvent } from "@testing-library/user-event";
import { render, screen, waitFor } from "@testing-library/react";
import { RJSFSchema } from "@rjsf/utils";
import FormBase from "@bciers/components/form/FormBase";
import {
  checkComboBoxWidgetValidationStyles,
  checkNoValidationErrorIsTriggered,
} from "@bciers/testConfig/helpers/form";

const multiSelectFieldLabel = "MultiSelectWidgetWithTooltip test field";
const multiSelectLabelRequired = `${multiSelectFieldLabel}*`;
const expectedMinItemsMessage = "Select at least one option";

export const multiSelectWithTooltipFieldSchema = {
  type: "object",
  required: ["multiSelectTestField"],
  properties: {
    multiSelectTestField: {
      type: "array",
      title: multiSelectFieldLabel,
      minItems: 1,
      items: {
        type: "string",
        enum: ["option_1", "option_2", "option_3"],
        enumNames: ["Option 1", "Option 2", "Option 3"],
        enumTooltips: [
          "Tooltip for Option 1",
          "Tooltip for Option 2",
          "Tooltip for Option 3",
        ],
      },
    },
  },
} as RJSFSchema;

export const multiSelectWithTooltipFieldUiSchema = {
  multiSelectTestField: {
    "ui:widget": "MultiSelectWidgetWithTooltip",
  },
};

// Schema without tooltips to test graceful degradation
const multiSelectWithoutTooltipFieldSchema = {
  type: "object",
  required: ["multiSelectTestField"],
  properties: {
    multiSelectTestField: {
      type: "array",
      title: multiSelectFieldLabel,
      minItems: 1,
      items: {
        type: "string",
        enum: ["option_1", "option_2", "option_3"],
        enumNames: ["Option 1", "Option 2", "Option 3"],
      },
    },
  },
} as RJSFSchema;

describe("RJSF MultiSelectWidgetWithTooltip", () => {
  it("should render a combo box field", async () => {
    render(
      <FormBase
        schema={multiSelectWithTooltipFieldSchema}
        uiSchema={multiSelectWithTooltipFieldUiSchema}
      />,
    );
    expect(screen.getByLabelText(multiSelectLabelRequired)).toBeVisible();
  });

  it("should render the combo box value when formData is provided", async () => {
    render(
      <FormBase
        schema={multiSelectWithTooltipFieldSchema}
        formData={{ multiSelectTestField: ["option_2"] }}
        uiSchema={multiSelectWithTooltipFieldUiSchema}
      />,
    );

    // Each displayed value is a MUI Chip/button
    expect(screen.getByText("Option 2")).toBeVisible();
  });

  it("should render multiple combo box values when formData is provided", async () => {
    render(
      <FormBase
        schema={multiSelectWithTooltipFieldSchema}
        formData={{ multiSelectTestField: ["option_1", "option_3"] }}
        uiSchema={multiSelectWithTooltipFieldUiSchema}
      />,
    );

    expect(screen.getByText("Option 1")).toBeVisible();
    expect(screen.getByText("Option 3")).toBeVisible();
  });

  it("should allow selecting a combo box value", async () => {
    render(
      <FormBase
        schema={multiSelectWithTooltipFieldSchema}
        uiSchema={multiSelectWithTooltipFieldUiSchema}
      />,
    );

    const combobox = screen.getByRole("combobox");
    await userEvent.click(combobox);

    const option3 = screen.getByText("Option 3");

    await userEvent.click(option3);

    expect(screen.getByText("Option 3")).toBeVisible();
  });

  it("should allow selecting multiple combo box values", async () => {
    render(
      <FormBase
        schema={multiSelectWithTooltipFieldSchema}
        uiSchema={multiSelectWithTooltipFieldUiSchema}
      />,
    );

    const combobox = screen.getByRole("combobox");
    await userEvent.click(combobox);

    const option1 = screen.getByText("Option 1");
    const option3 = screen.getByText("Option 3");
    await userEvent.click(option3);

    await userEvent.click(combobox);

    await userEvent.click(option1);

    expect(screen.getByText("Option 1")).toBeVisible();
    expect(screen.getByText("Option 3")).toBeVisible();
  });

  it("should show tooltip when navigating dropdown options with keyboard", async () => {
    render(
      <FormBase
        schema={multiSelectWithTooltipFieldSchema}
        uiSchema={multiSelectWithTooltipFieldUiSchema}
      />,
    );

    const combobox = screen.getByRole("combobox");
    await userEvent.click(combobox);

    // Press arrow down to highlight first option
    await userEvent.keyboard("{ArrowDown}");

    await waitFor(() => {
      expect(screen.getByRole("tooltip")).toBeVisible();
      expect(screen.getByRole("tooltip")).toHaveTextContent(
        "Tooltip for Option 1",
      );
    });

    await userEvent.keyboard("{ArrowDown}");

    await waitFor(() => {
      expect(screen.getByRole("tooltip")).toHaveTextContent(
        "Tooltip for Option 2",
      );
    });

    await userEvent.keyboard("{ArrowDown}");

    await waitFor(() => {
      expect(screen.getByRole("tooltip")).toHaveTextContent(
        "Tooltip for Option 3",
      );
    });
  });

  it("should show tooltip with prefix when ui:tooltipPrefix is provided", async () => {
    const multiSelectWithTooltipPrefixUiSchema = {
      multiSelectTestField: {
        "ui:widget": "MultiSelectWidgetWithTooltip",
        "ui:tooltipPrefix": "Regulatory name: ",
      },
    };

    render(
      <FormBase
        schema={multiSelectWithTooltipFieldSchema}
        uiSchema={multiSelectWithTooltipPrefixUiSchema}
      />,
    );

    const combobox = screen.getByRole("combobox");
    await userEvent.click(combobox);
    await userEvent.keyboard("{ArrowDown}");

    await waitFor(() => {
      const tooltip = screen.getByRole("tooltip");
      expect(tooltip).toBeVisible();
      expect(tooltip).toHaveTextContent(
        "Regulatory name: Tooltip for Option 1",
      );
    });
  });

  it("should show tooltip when hovering over a selected chip", async () => {
    render(
      <FormBase
        schema={multiSelectWithTooltipFieldSchema}
        formData={{ multiSelectTestField: ["option_1"] }}
        uiSchema={multiSelectWithTooltipFieldUiSchema}
      />,
    );

    const chip = screen.getByText("Option 1");
    await userEvent.hover(chip);

    await waitFor(() => {
      expect(screen.getByRole("tooltip")).toBeVisible();
      expect(screen.getByRole("tooltip")).toHaveTextContent(
        "Tooltip for Option 1",
      );
    });
  });

  it("should allow typing to filter and select a combo box value", async () => {
    render(
      <FormBase
        schema={multiSelectWithTooltipFieldSchema}
        uiSchema={multiSelectWithTooltipFieldUiSchema}
      />,
    );

    const multiSelectInput = screen.getByRole("combobox") as HTMLInputElement;

    // Type to filter options
    await userEvent.type(multiSelectInput, "Option 3");

    // Click on the filtered option
    const option3 = screen.getByText("Option 3");
    await userEvent.click(option3);

    // Verify it was selected
    expect(screen.getByRole("button", { name: /Option 3/i })).toBeVisible();
  });

  it("should allow clearing the combo box", async () => {
    render(
      <FormBase
        schema={multiSelectWithTooltipFieldSchema}
        formData={{ multiSelectTestField: ["option_2", "option_3"] }}
        uiSchema={multiSelectWithTooltipFieldUiSchema}
      />,
    );

    await userEvent.click(screen.getAllByTestId("CancelIcon")[0]); // Remove Option 2
    const selectedOption2 = screen.queryByRole("button", {
      name: "Option 2",
    });
    expect(selectedOption2).not.toBeInTheDocument();

    await userEvent.click(screen.getAllByTestId("CancelIcon")[0]);
    const selectedOption3 = screen.queryByRole("button", {
      name: "Option 3",
    });
    expect(selectedOption3).not.toBeInTheDocument();
  });

  it("should render the placeholder text", async () => {
    render(
      <FormBase
        schema={multiSelectWithTooltipFieldSchema}
        uiSchema={{
          multiSelectTestField: {
            "ui:widget": "MultiSelectWidgetWithTooltip",
            "ui:placeholder": "Select regulated products",
          },
        }}
      />,
    );
    expect(
      screen.getByPlaceholderText("Select regulated products..."),
    ).toBeVisible();
  });

  it("should use the enum values as the names if no enumNames are provided", async () => {
    render(
      <FormBase
        schema={{
          type: "object",
          required: ["multiSelectTestField"],
          properties: {
            multiSelectTestField: {
              type: "array",
              title: multiSelectFieldLabel,
              items: {
                type: "string",
                enum: ["option_1", "option_2", "option_3"],
              },
            },
          },
        }}
        uiSchema={multiSelectWithTooltipFieldUiSchema}
      />,
    );
    const combobox = screen.getByRole("combobox");
    await userEvent.click(combobox);

    const option1 = screen.getByText("option_1");
    const option2 = screen.getByText("option_2");
    const option3 = screen.getByText("option_3");

    expect(option1).toBeVisible();
    expect(option2).toBeVisible();
    expect(option3).toBeVisible();
  });

  it("should work without tooltips (graceful degradation)", async () => {
    render(
      <FormBase
        schema={multiSelectWithoutTooltipFieldSchema}
        uiSchema={multiSelectWithTooltipFieldUiSchema}
      />,
    );

    const combobox = screen.getByRole("combobox");
    await userEvent.click(combobox);

    const option1 = screen.getByText("Option 1");
    await userEvent.click(option1);

    expect(screen.getByRole("button", { name: /Option 1/i })).toBeVisible();
  });

  it("should not trigger an error message when the value is valid", async () => {
    render(
      <FormBase
        schema={multiSelectWithTooltipFieldSchema}
        uiSchema={multiSelectWithTooltipFieldUiSchema}
        formData={{ multiSelectTestField: ["option_2"] }}
      />,
    );
    await checkNoValidationErrorIsTriggered();
  });

  it("shows no options when no options are given", async () => {
    render(
      <FormBase
        schema={
          {
            type: "object",
            required: ["multiSelectTestField"],
            properties: {
              multiSelectTestField: {
                type: "array",
                title: multiSelectFieldLabel,
                items: {
                  type: "string",
                  enum: undefined,
                },
              },
            },
          } as RJSFSchema
        }
        uiSchema={multiSelectWithTooltipFieldUiSchema}
      />,
    );

    // Click on the combobox to open the dropdown
    const combobox = screen.getByRole("combobox");
    await userEvent.click(combobox);

    // When no options are provided, the options array is empty
    // Verify that no menu items are rendered
    const menuItems = screen.queryAllByRole("option");
    expect(menuItems).toHaveLength(0);
  });

  it("should show an error message when the combo box is required and no value is selected", async () => {
    render(
      <FormBase
        schema={multiSelectWithTooltipFieldSchema}
        uiSchema={multiSelectWithTooltipFieldUiSchema}
      />,
    );

    const submitButton = screen.getByRole("button", { name: "Submit" });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(expectedMinItemsMessage)).toBeVisible();
    });
  });

  it("should not trigger validation error when field has a value", async () => {
    render(
      <FormBase
        schema={multiSelectWithTooltipFieldSchema}
        uiSchema={multiSelectWithTooltipFieldUiSchema}
        formData={{ multiSelectTestField: ["option_1"] }}
      />,
    );

    await checkNoValidationErrorIsTriggered();
  });

  it("should not trigger an error message when the value is valid", async () => {
    render(
      <FormBase
        schema={multiSelectWithTooltipFieldSchema}
        uiSchema={multiSelectWithTooltipFieldUiSchema}
        formData={{ multiSelectTestField: ["option_2"] }}
      />,
    );
    await checkNoValidationErrorIsTriggered();
  });

  it("should not show an error message when the combo box is required and a value is selected", async () => {
    render(
      <FormBase
        schema={multiSelectWithTooltipFieldSchema}
        uiSchema={multiSelectWithTooltipFieldUiSchema}
        formData={{ multiSelectTestField: ["option_2"] }}
      />,
    );

    const submitButton = screen.getByRole("button", { name: "Submit" });

    await userEvent.click(submitButton);

    expect(screen.queryByText(expectedMinItemsMessage)).not.toBeInTheDocument();
  });

  it("should show an error message when the combo box is required and an invalid value is typed", async () => {
    render(
      <FormBase
        schema={multiSelectWithTooltipFieldSchema}
        uiSchema={multiSelectWithTooltipFieldUiSchema}
      />,
    );

    const multiSelectInput = screen.getByRole("combobox") as HTMLInputElement;

    await userEvent.type(multiSelectInput, "Invalid option");

    await userEvent.keyboard("{enter}");

    const submitButton = screen.getByRole("button", { name: /Submit/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(expectedMinItemsMessage)).toBeVisible();
    });
  });

  it("should have the correct styles when the validation error is shown", async () => {
    await checkComboBoxWidgetValidationStyles(
      <FormBase
        schema={multiSelectWithTooltipFieldSchema}
        uiSchema={multiSelectWithTooltipFieldUiSchema}
      />,
    );
  });
});
