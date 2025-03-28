import { userEvent } from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import { RJSFSchema } from "@rjsf/utils";
import FormBase from "@bciers/components/form/FormBase";
import { checkNoValidationErrorIsTriggered } from "@bciers/testConfig/helpers/form";
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
  },
};

describe("RJSF CheckboxWidget", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("should render a checkbox field", async () => {
    render(
      <FormBase
        schema={checkboxFieldSchema}
        uiSchema={checkboxFieldUiSchema}
      />,
    );
    expect(screen.getByLabelText(checkboxFieldLabel)).toBeVisible();
  });

  it("should be unchecked by default", async () => {
    render(
      <FormBase
        schema={checkboxFieldSchema}
        uiSchema={checkboxFieldUiSchema}
      />,
    );

    const checkbox = screen.getByRole("checkbox");

    expect(checkbox).not.toBeChecked();
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

  it("should not trigger an error when data is valid", async () => {
    render(
      <FormBase
        schema={checkboxFieldSchema}
        formData={{ checkboxTestField: true }}
        uiSchema={checkboxFieldUiSchema}
      />,
    );

    await checkNoValidationErrorIsTriggered();
  });

  it("should trigger validation error for required field", async () => {
    render(
      <FormBase
        schema={checkboxFieldSchema}
        uiSchema={checkboxFieldUiSchema}
      />,
    );
    const submitButton = screen.getByRole("button", { name: "Submit" });

    await userEvent.click(submitButton);

    expect(screen.getByText("Required field")).toBeVisible();
  });

  it("should have the correct styles when the validation error is shown", async () => {
    render(
      <FormBase
        schema={checkboxFieldSchema}
        uiSchema={checkboxFieldUiSchema}
      />,
    );
  });
});
