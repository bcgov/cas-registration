import { userEvent } from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import { RJSFSchema } from "@rjsf/utils";
import FormBase from "@bciers/components/form/FormBase";
import { checkNoValidationErrorIsTriggered } from "@/tests/helpers/form";

const textAreaFieldLabel = "Text Area Test Field";
const textAreaLabelRequired = `${textAreaFieldLabel}*`;

export const textAreaFieldSchema = {
  type: "object",
  required: ["textAreaTestField"],
  properties: {
    textAreaTestField: { type: "string", title: textAreaFieldLabel },
  },
} as RJSFSchema;

describe("RJSF TextAreaWidget", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should render a text area field", () => {
    render(<FormBase schema={textAreaFieldSchema} />);
    expect(screen.getByLabelText(textAreaLabelRequired)).toBeVisible();
  });

  it("should be empty by default", () => {
    render(<FormBase schema={textAreaFieldSchema} />);
    const textArea = screen.getByLabelText(textAreaLabelRequired);
    expect(textArea).toHaveValue("");
  });

  it("should render the string value when formData is provided", () => {
    render(
      <FormBase
        schema={textAreaFieldSchema}
        formData={{ textAreaTestField: "Sample text" }}
      />,
    );

    const textArea = screen.getByLabelText(textAreaLabelRequired);
    expect(textArea).toHaveValue("Sample text");
  });

  it("should allow entering text", async () => {
    render(<FormBase schema={textAreaFieldSchema} />);
    const textArea = screen.getByLabelText(textAreaLabelRequired);
    await userEvent.type(textArea, "This is a test");
    expect(textArea).toHaveValue("This is a test");
  });

  it("should not trigger validation for a valid string value", async () => {
    render(
      <FormBase
        schema={textAreaFieldSchema}
        formData={{ textAreaTestField: "Valid text" }}
      />,
    );

    await checkNoValidationErrorIsTriggered();
  });

  it("should display the error message when the field is required and empty", async () => {
    render(<FormBase schema={textAreaFieldSchema} />);
    const submitButton = screen.getByRole("button", { name: "Submit" });

    await userEvent.click(submitButton);

    expect(screen.getByText("Required field")).toBeVisible();
  });

  it("should render a placeholder if provided in the uiSchema", () => {
    const placeholder = "Enter your text here";
    const textAreaUiSchema = {
      textAreaTestField: {
        "ui:placeholder": placeholder,
      },
    };

    render(
      <FormBase schema={textAreaFieldSchema} uiSchema={textAreaUiSchema} />,
    );

    const textArea = screen.getByPlaceholderText(placeholder);
    expect(textArea).toBeVisible();
  });
});
