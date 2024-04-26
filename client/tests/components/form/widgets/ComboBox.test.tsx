import { userEvent } from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import { RJSFSchema } from "@rjsf/utils";
import FormBase from "@/app/components/form/FormBase";
import { checkComboBoxWidgetValidationStyles } from "@/tests/helpers/form";

const comboBoxFieldLabel = "ComboBox test field";
const comboBoxLabelRequired = `${comboBoxFieldLabel}*`;

const comboBoxFieldSchema = {
  type: "object",
  required: ["comboBoxTestField"],
  properties: {
    comboBoxTestField: {
      type: "string",
      title: comboBoxFieldLabel,
      anyOf: [
        { const: "option_1", title: "Option 1" },
        { const: "option_2", title: "Option 2" },
        { const: "option_3", title: "Option 3" },
      ],
    },
  },
} as RJSFSchema;

const comboBoxFieldUiSchema = {
  comboBoxTestField: {
    "ui:widget": "ComboBox",
  },
};

describe("RJSF ComboBoxWidget", () => {
  it("should render a combo box field", async () => {
    render(
      <FormBase
        schema={comboBoxFieldSchema}
        uiSchema={comboBoxFieldUiSchema}
      />,
    );
    expect(screen.getByLabelText(comboBoxLabelRequired)).toBeVisible();
  });

  it("should render the combo box value when formData is provided", async () => {
    render(
      <FormBase
        schema={comboBoxFieldSchema}
        formData={{ comboBoxTestField: "option_2" }}
        uiSchema={comboBoxFieldUiSchema}
      />,
    );

    const comboBoxInput = screen.getByRole("combobox") as HTMLInputElement;

    expect(comboBoxInput.value).toBe("Option 2");
  });

  it("should allow selecting a combo box value", async () => {
    render(
      <FormBase
        schema={comboBoxFieldSchema}
        uiSchema={comboBoxFieldUiSchema}
      />,
    );

    const comboBoxInput = screen.getByRole("combobox") as HTMLInputElement;
    const openComboboxButton = comboBoxInput?.parentElement?.children[1]
      ?.children[0] as HTMLInputElement;

    await userEvent.click(openComboboxButton);

    const option3 = screen.getByText("Option 3");

    await userEvent.click(option3);

    expect(comboBoxInput.value).toBe("Option 3");
  });

  it("should allow typing a combo box value", async () => {
    render(
      <FormBase
        schema={comboBoxFieldSchema}
        uiSchema={comboBoxFieldUiSchema}
      />,
    );

    const comboBoxInput = screen.getByRole("combobox") as HTMLInputElement;

    await userEvent.type(comboBoxInput, "Option 3{enter}");

    expect(comboBoxInput.value).toBe("Option 3");
  });

  it("should allow clearing a combo box value", async () => {
    render(
      <FormBase
        schema={comboBoxFieldSchema}
        formData={{ comboBoxTestField: "option_2" }}
        uiSchema={comboBoxFieldUiSchema}
      />,
    );

    const comboBoxInput = screen.getByRole("combobox") as HTMLInputElement;
    const clearButton = comboBoxInput?.parentElement?.children[1]
      ?.children[0] as HTMLInputElement;

    await userEvent.click(clearButton);

    expect(comboBoxInput.value).toBe("");
  });

  it("should show an error message when the combo box is required and no value is selected", async () => {
    render(
      <FormBase
        schema={comboBoxFieldSchema}
        uiSchema={comboBoxFieldUiSchema}
      />,
    );

    const submitButton = screen.getByRole("button", { name: "Submit" });

    await userEvent.click(submitButton);

    expect(screen.getByText("Required field")).toBeVisible();
  });

  it("should not show an error message when the combo box is required and a value is selected", async () => {
    render(
      <FormBase
        schema={comboBoxFieldSchema}
        uiSchema={comboBoxFieldUiSchema}
        formData={{ comboBoxTestField: "option_2" }}
      />,
    );

    const submitButton = screen.getByRole("button", { name: "Submit" });

    await userEvent.click(submitButton);

    expect(screen.queryByText("Required field")).toBeNull();
  });

  it("should show an error message when the combo box is required and an invalid value is typed", async () => {
    render(
      <FormBase
        schema={comboBoxFieldSchema}
        uiSchema={comboBoxFieldUiSchema}
      />,
    );

    const comboBoxInput = screen.getByRole("combobox") as HTMLInputElement;

    await userEvent.type(comboBoxInput, "Invalid option{enter}");

    const submitButton = screen.getByRole("button", { name: "Submit" });

    await userEvent.click(submitButton);

    expect(screen.queryByText("Required field")).toBeVisible();
  });

  it("should have the correct styles when the validation error is shown", async () => {
    checkComboBoxWidgetValidationStyles(
      <FormBase
        schema={comboBoxFieldSchema}
        uiSchema={comboBoxFieldUiSchema}
      />,
    );
  });
});
