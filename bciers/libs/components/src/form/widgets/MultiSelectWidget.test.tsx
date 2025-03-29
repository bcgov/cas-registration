import { userEvent } from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import { RJSFSchema } from "@rjsf/utils";
import FormBase from "@bciers/components/form/FormBase";
import {
  checkNoValidationErrorIsTriggered,
  checkComboBoxWidgetValidationStyles,
} from "@bciers/testConfig/helpers/form";

const multiSelectFieldLabel = "MultiSelectWidget test field";
const multiSelectLabelRequired = `${multiSelectFieldLabel}*`;
const expectedMinItemsMessage = "Must not have fewer than 1 items";

export const multiSelectFieldSchema = {
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

export const multiSelectFieldUiSchema = {
  multiSelectTestField: {
    "ui:widget": "MultiSelectWidget",
  },
};

describe("RJSF MultiSelectWidget", () => {
  it("should render a combo box field", async () => {
    render(
      <FormBase
        schema={multiSelectFieldSchema}
        uiSchema={multiSelectFieldUiSchema}
      />,
    );
    expect(screen.getByLabelText(multiSelectLabelRequired)).toBeVisible();
  });

  it("should render the combo box value when formData is provided", async () => {
    render(
      <FormBase
        schema={multiSelectFieldSchema}
        formData={{ multiSelectTestField: ["option_2"] }}
        uiSchema={multiSelectFieldUiSchema}
      />,
    );

    // Each displayed value is a MUI Chip/button
    expect(screen.getByRole("button", { name: "Option 2" })).toBeVisible();
  });

  it("should render multiple combo box values when formData is provided", async () => {
    render(
      <FormBase
        schema={multiSelectFieldSchema}
        formData={{ multiSelectTestField: ["option_1", "option_3"] }}
        uiSchema={multiSelectFieldUiSchema}
      />,
    );

    expect(screen.getByText("Option 1")).toBeVisible();
    expect(screen.getByText("Option 3")).toBeVisible();
  });

  it("should allow selecting a combo box value", async () => {
    render(
      <FormBase
        schema={multiSelectFieldSchema}
        uiSchema={multiSelectFieldUiSchema}
      />,
    );

    const openMultiSelectButton = screen.getByRole("button", { name: "Open" });
    await userEvent.click(openMultiSelectButton);

    const option3 = screen.getByText("Option 3");

    await userEvent.click(option3);

    expect(screen.getByRole("button", { name: "Option 3" })).toBeVisible();
  });

  it("should allow selecting multiple combo box values", async () => {
    render(
      <FormBase
        schema={multiSelectFieldSchema}
        uiSchema={multiSelectFieldUiSchema}
      />,
    );

    const openMultiSelectButton = screen.getByRole("button", { name: "Open" });
    await userEvent.click(openMultiSelectButton);

    const option1 = screen.getByText("Option 1");
    const option3 = screen.getByText("Option 3");

    await userEvent.click(option1);

    await userEvent.click(openMultiSelectButton);

    await userEvent.click(option3);

    expect(screen.getByText("Option 1")).toBeVisible();
    expect(screen.getByText("Option 3")).toBeVisible();
  });

  it("should allow typing a combo box value", async () => {
    render(
      <FormBase
        schema={multiSelectFieldSchema}
        uiSchema={multiSelectFieldUiSchema}
      />,
    );

    const multiSelectInput = screen.getByRole("combobox") as HTMLInputElement;

    await userEvent.type(multiSelectInput, "Option 3{enter}");

    expect(screen.getByRole("button", { name: "Option 3" })).toBeVisible();
  });

  it("should allow clearing the combo box", async () => {
    render(
      <FormBase
        schema={multiSelectFieldSchema}
        formData={{ multiSelectTestField: ["option_2", "option_3"] }}
        uiSchema={multiSelectFieldUiSchema}
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
  it("should render the  placeholder text", async () => {
    render(
      <FormBase
        schema={multiSelectFieldSchema}
        uiSchema={{
          multiSelectTestField: {
            "ui:widget": "MultiSelectWidget",
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
        uiSchema={multiSelectFieldUiSchema}
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

  it("should not trigger an error message when the value is valid", async () => {
    render(
      <FormBase
        schema={multiSelectFieldSchema}
        uiSchema={multiSelectFieldUiSchema}
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
        uiSchema={multiSelectFieldUiSchema}
      />,
    );
    const openMultiSelectButton = screen.getByRole("button", { name: "Open" });
    await userEvent.click(openMultiSelectButton);
    expect(screen.getByText(/no options/i)).toBeVisible();
  });

  it("should show an error message when the combo box is required and no value is selected", async () => {
    render(
      <FormBase
        schema={multiSelectFieldSchema}
        uiSchema={multiSelectFieldUiSchema}
      />,
    );

    const submitButton = screen.getByRole("button", { name: "Submit" });

    await userEvent.click(submitButton);

    expect(screen.getByText(expectedMinItemsMessage)).toBeVisible();
  });

  it("should not show an error message when the combo box is required and a value is selected", async () => {
    render(
      <FormBase
        schema={multiSelectFieldSchema}
        uiSchema={multiSelectFieldUiSchema}
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
        schema={multiSelectFieldSchema}
        uiSchema={multiSelectFieldUiSchema}
      />,
    );

    const multiSelectInput = screen.getByRole("combobox") as HTMLInputElement;

    await userEvent.type(multiSelectInput, "Invalid option{enter}");

    const submitButton = screen.getByRole("button", { name: "Submit" });

    await userEvent.click(submitButton);

    expect(screen.queryByText(expectedMinItemsMessage)).toBeVisible();
  });

  it("should have the correct styles when the validation error is shown", async () => {
    await checkComboBoxWidgetValidationStyles(
      <FormBase
        schema={multiSelectFieldSchema}
        uiSchema={multiSelectFieldUiSchema}
      />,
    );
  });
});
