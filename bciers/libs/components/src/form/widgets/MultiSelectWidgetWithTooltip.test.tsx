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

// UI schema with tooltip prefix
export const multiSelectWithTooltipPrefixUiSchema = {
  multiSelectTestField: {
    "ui:widget": "MultiSelectWidgetWithTooltip",
    "ui:tooltipPrefix": "Regulatory name: ",
  },
};

// Schema without tooltips to test graceful degradation
export const multiSelectWithoutTooltipFieldSchema = {
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
        formData={{ multiSelectTestField: ["option_2", "option_3"] }}
        uiSchema={multiSelectWithTooltipFieldUiSchema}
      />,
    );

    // Each displayed value is a MUI Chip/button
    expect(screen.getByText("Option 2")).toBeVisible();
    expect(screen.getByText("Option 3")).toBeVisible();
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

  it("should allow selecting a value", async () => {
    render(
      <FormBase
        schema={multiSelectWithTooltipFieldSchema}
        uiSchema={multiSelectWithTooltipFieldUiSchema}
      />,
    );

    const openMultiSelectButton = screen.getByRole("button", { name: "Open" });
    await userEvent.click(openMultiSelectButton);

    const option3 = screen.getByText("Option 3");

    await userEvent.click(option3);

    expect(screen.getByText("Option 3")).toBeVisible();
  });

  it("should allow selecting multiple values", async () => {
    render(
      <FormBase
        schema={multiSelectWithTooltipFieldSchema}
        uiSchema={multiSelectWithTooltipFieldUiSchema}
      />,
    );

    const openMultiSelectButton = screen.getByRole("button", { name: "Open" });
    await userEvent.click(openMultiSelectButton);

    const option2 = screen.getByText("Option 2");
    const option3 = screen.getByText("Option 3");
    await userEvent.click(option3);

    await userEvent.click(openMultiSelectButton);

    await userEvent.click(option2);

    expect(screen.getByText("Option 2")).toBeVisible();
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

    // Navigate down with keyboard - first option should be highlighted by autoHighlight
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
    render(
      <FormBase
        schema={multiSelectWithTooltipFieldSchema}
        uiSchema={multiSelectWithTooltipPrefixUiSchema}
      />,
    );

    const combobox = screen.getByRole("combobox");
    await userEvent.click(combobox);

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

  it("should allow typing a combo box value", async () => {
    render(
      <FormBase
        schema={multiSelectWithTooltipFieldSchema}
        uiSchema={multiSelectWithTooltipFieldUiSchema}
      />,
    );

    const multiSelectInput = screen.getByRole("combobox") as HTMLInputElement;

    await userEvent.type(multiSelectInput, "Option 3{enter}");

    expect(screen.getByText("Option 3")).toBeVisible();
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
    // TODO: Fix this test(ticket https://github.com/bcgov/cas-registration/issues/2365)
    // This test case doesn't fail when working with the component in the browser but it fails when running the tests
    // It might be related to props we pass to the widget(Error: cannot read property 'filter' of undefined)

    // await userEvent.click(screen.getAllByTestId("CancelIcon")[0]); // Remove Option 3
    // const selectedOption3 = screen.queryByRole("button", {
    //   name: "Option 3",
    // });
    // expect(selectedOption3).not.toBeInTheDocument();
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
    const openMultiSelectButton = screen.getByRole("button", { name: "Open" });
    await userEvent.click(openMultiSelectButton);

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

    const openMultiSelectButton = screen.getByRole("button", { name: "Open" });
    await userEvent.click(openMultiSelectButton);

    const option1 = screen.getByText("Option 1");
    await userEvent.click(option1);

    expect(screen.getByRole("button", { name: "Option 1" })).toBeVisible();
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
    const openMultiSelectButton = screen.getByRole("button", { name: "Open" });
    await userEvent.click(openMultiSelectButton);
    expect(screen.getByText(/no options/i)).toBeVisible();
  });

  it("should trigger validation error when required field is empty", async () => {
    render(
      <FormBase
        schema={multiSelectWithTooltipFieldSchema}
        uiSchema={multiSelectWithTooltipFieldUiSchema}
      />,
    );

    const submitButton = screen.getByRole("button", { name: /submit/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(expectedMinItemsMessage)).toBeVisible();
    });
  });

  it("should not trigger validation error when field has a value", async () => {
    render(
      <FormBase
        schema={multiSelectWithTooltipFieldSchema}
        formData={{ multiSelectTestField: ["option_1"] }}
        uiSchema={multiSelectWithTooltipFieldUiSchema}
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

  it("should show an error message when the combo box is required and an invalid value is typed", async () => {
    render(
      <FormBase
        schema={multiSelectWithTooltipFieldSchema}
        uiSchema={multiSelectWithTooltipFieldUiSchema}
      />,
    );

    const multiSelectInput = screen.getByRole("combobox") as HTMLInputElement;

    await userEvent.type(multiSelectInput, "Invalid option{enter}");

    const submitButton = screen.getByRole("button", { name: "Submit" });

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
