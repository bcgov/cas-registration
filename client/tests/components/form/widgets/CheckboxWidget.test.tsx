import { userEvent } from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import { RJSFSchema } from "@rjsf/utils";
import FormBase from "@/app/components/form/FormBase";

const checkboxFieldLabel = "Checkbox test field";

const checkboxFieldSchema = {
  type: "object",
  required: ["checkboxTestField"],
  properties: {
    checkboxTestField: {
      type: "boolean",
      title: checkboxFieldLabel,
    },
  },
} as RJSFSchema;

const checkboxFieldUiSchema = {
  checkboxTestField: {
    "ui:widget": "CheckboxWidget",
    "ui:options": {
      label: false,
    },
  },
};

describe("RJSF CheckboxWidget", () => {
  it("should render a checkbox field", async () => {
    render(
      <FormBase
        schema={checkboxFieldSchema}
        uiSchema={checkboxFieldUiSchema}
      />,
    );
    expect(screen.getByLabelText(checkboxFieldLabel)).toBeVisible();
  });

  it("should render the checkbox value when formData is provided", async () => {
    render(
      <FormBase
        schema={checkboxFieldSchema}
        formData={{ checkboxTestField: true }}
        uiSchema={checkboxFieldUiSchema}
      />,
    );

    const checkbox = screen.getByRole("checkbox");

    expect(checkbox).toBeChecked();
  });

  it("should allow checking the checkbox", async () => {
    render(
      <FormBase
        schema={checkboxFieldSchema}
        uiSchema={checkboxFieldUiSchema}
      />,
    );

    const checkbox = screen.getByRole("checkbox");

    expect(checkbox).not.toBeChecked();

    await userEvent.click(checkbox);

    expect(checkbox).toBeChecked();
  });

  it("should allow unchecking the checkbox", async () => {
    render(
      <FormBase
        schema={checkboxFieldSchema}
        uiSchema={checkboxFieldUiSchema}
      />,
    );

    const checkbox = screen.getByRole("checkbox");

    await userEvent.click(checkbox);

    expect(checkbox).toBeChecked();

    await userEvent.click(checkbox);

    expect(checkbox).not.toBeChecked();
  });
});
