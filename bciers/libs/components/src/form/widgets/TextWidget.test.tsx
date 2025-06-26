import { userEvent } from "@testing-library/user-event";
import { render, screen, fireEvent } from "@testing-library/react";
import { RJSFSchema } from "@rjsf/utils";
import FormBase from "@bciers/components/form/FormBase";
import TextWidget from "./TextWidget";
import { checkTextWidgetValidationStyles } from "@bciers/testConfig/helpers/form";

const stringFieldLabel = "String test field";
const numberFieldLabel = "Number test field";
const stringLabelRequired = `${stringFieldLabel}*`;
const numberLabelRequired = `${numberFieldLabel}*`;

export const stringFieldSchema = {
  type: "object",
  required: ["stringTestField"],
  properties: {
    stringTestField: { type: "string", title: stringFieldLabel },
  },
} as RJSFSchema;

export const numberFieldSchema = {
  type: "object",
  required: ["numberTestField"],
  properties: {
    numberTestField: { type: "number", title: numberFieldLabel },
  },
} as RJSFSchema;

describe("RJSF TextWidget", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should be empty by default", () => {
    render(<FormBase schema={stringFieldSchema} />);
    const input = screen.getByLabelText(stringLabelRequired);
    expect(input).toHaveValue("");
    expect(screen.queryByText("NaN")).not.toBeInTheDocument();
  });

  it("should render the string value when formData is provided", () => {
    render(
      <FormBase
        schema={stringFieldSchema}
        formData={{ stringTestField: "test!123" }}
      />,
    );

    const input = screen.getByLabelText(stringLabelRequired);
    expect(input).toHaveValue("test!123");
  });

  it("should render the number value when formData is provided", () => {
    render(
      <FormBase
        schema={numberFieldSchema}
        formData={{ numberTestField: 123456.789 }}
      />,
    );

    const input = screen.getByLabelText(numberLabelRequired);
    expect(input).toHaveValue("123,456.789");
  });

  it("should render the number value when the schema has type number, even if the value is type string", () => {
    render(
      <FormBase
        schema={numberFieldSchema}
        formData={{ numberTestField: "4562.35" }}
      />,
    );

    const input = screen.getByLabelText(numberLabelRequired);
    expect(input).toHaveValue("4,562.35");
  });

  it("should not render NaN", () => {
    render(<FormBase schema={numberFieldSchema} />);

    const input = screen.getByLabelText(numberLabelRequired);
    expect(input).toHaveValue("");
  });

  it("should allow entering text", async () => {
    render(<FormBase schema={stringFieldSchema} />);
    const input = screen.getByLabelText(stringLabelRequired);
    await userEvent.type(input, "test");
    expect(input).toHaveValue("test");
  });

  it("should only allow entering numbers in a number field", async () => {
    render(<FormBase schema={numberFieldSchema} />);
    const input = screen.getByLabelText(numberLabelRequired);

    // Should not allow text
    await userEvent.type(input, "text");
    expect(input).toHaveValue("");
  });

  it("should display the error message when a field is required and empty", async () => {
    render(<FormBase schema={stringFieldSchema} />);
    const submitButton = screen.getByRole("button", { name: "Submit" });

    await userEvent.click(submitButton);

    expect(screen.getByText(/^.* is required/i)).toBeVisible();
  });

  it("should have the correct styling when a field is required and empty", async () => {
    await checkTextWidgetValidationStyles(
      <FormBase schema={stringFieldSchema} />,
      stringLabelRequired,
    );
  });

  it("calls onChange when text input value changes", () => {
    const handleChange = vi.fn();
    render(
      <TextWidget
        id="test-text"
        schema={{ type: "text" }}
        uiSchema={{}}
        onChange={handleChange}
        value=""
        name="testName"
      />,
    );

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "New Value" } });
    expect(handleChange).toHaveBeenCalledWith("New Value");
  });

  it("calls onChange when number input value changes", () => {
    const handleChange = vi.fn();
    render(
      <TextWidget
        id="test-number"
        schema={{ type: "number" }}
        uiSchema={{}}
        onChange={handleChange}
        value={null}
        name="testNumber"
      />,
    );

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "456" } });
    expect(handleChange).toHaveBeenCalledWith(456);
  });
});
