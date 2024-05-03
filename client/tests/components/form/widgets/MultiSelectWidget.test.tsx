import { userEvent } from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import { RJSFSchema } from "@rjsf/utils";
import FormBase from "@/app/components/form/FormBase";

const multiSelectFieldLabel = "MultiSelectWidget test field";
const multiSelectLabelRequired = `${multiSelectFieldLabel}*`;

export const multiSelectFieldSchema = {
  type: "object",
  required: ["multiSelectTestField"],
  properties: {
    multiSelectTestField: {
      type: "array",
      title: multiSelectFieldLabel,
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

    const selectedOption1 = screen.getByRole("button", { name: "Option 2" });
    const selectedOption2 = screen.getByRole("button", { name: "Option 3" });
    const optionCancelIcon = screen.getByTestId("CloseIcon");

    await userEvent.click(optionCancelIcon);

    expect(selectedOption1).not.toBeInTheDocument();
    expect(selectedOption2).not.toBeInTheDocument();
  });

  // TODO: This is currently broken in MultiSelectWidget
  // A required array field required minItems to be set to 1 which currently breaks MultiSelectWidget
  //
  // it("should show an error message when the combo box is required and no value is selected", async () => {
  //   render(
  //     <FormBase
  //       schema={multiSelectFieldSchema}
  //       uiSchema={multiSelectFieldUiSchema}
  //     />,
  //   );
  //
  //   const submitButton = screen.getByRole("button", { name: "Submit" });
  //
  //   await userEvent.click(submitButton);
  //
  //   expect(screen.getByText("Required field")).toBeVisible();
  // });

  // This works because required field functionality is broken
  // it("should not show an error message when the combo box is required and a value is selected", async () => {
  //   render(
  //     <FormBase
  //       schema={multiSelectFieldSchema}
  //       uiSchema={multiSelectFieldUiSchema}
  //       formData={{ multiSelectTestField: ["option_2"] }}
  //     />,
  //   );
  //
  //   const submitButton = screen.getByRole("button", { name: "Submit" });
  //
  //   await userEvent.click(submitButton);
  //
  //   expect(screen.queryByText("Required field")).toBeNull();
  // });

  // it("should show an error message when the combo box is required and an invalid value is typed", async () => {
  //   render(
  //     <FormBase
  //       schema={multiSelectFieldSchema}
  //       uiSchema={multiSelectFieldUiSchema}
  //     />,
  //   );
  //
  //   const multiSelectInput = screen.getByRole("combobox") as HTMLInputElement;
  //
  //   await userEvent.type(multiSelectInput, "Invalid option{enter}");
  //
  //   const submitButton = screen.getByRole("button", { name: "Submit" });
  //
  //   await userEvent.click(submitButton);
  //
  //   expect(screen.queryByText("Required field")).toBeVisible();
  // });

  // it("should have the correct styles when the validation error is shown", async () => {
  //   checkComboBoxWidgetValidationStyles(
  //     <FormBase
  //       schema={multiSelectFieldSchema}
  //       uiSchema={multiSelectFieldUiSchema}
  //     />,
  //   );
  // });
});
