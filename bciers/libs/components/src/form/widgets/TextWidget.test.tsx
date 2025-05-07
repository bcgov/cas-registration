import { userEvent } from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import { RJSFSchema } from "@rjsf/utils";
import FormBase from "@bciers/components/form/FormBase";
import {
  checkNoValidationErrorIsTriggered,
  checkTextWidgetValidationStyles,
} from "@bciers/testConfig/helpers/form";

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

const numberFieldUiSchemaWithMax = {
  numberTestField: {
    "ui:options": {
      max: 10,
    },
  },
};

describe("RJSF TextWidget", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });
  it("should render a text field", () => {
    render(<FormBase schema={stringFieldSchema} />);
    expect(screen.getByLabelText(stringLabelRequired)).toBeVisible();
  });

  it("should render a number field", () => {
    render(<FormBase schema={numberFieldSchema} />);
    expect(screen.getByLabelText(numberLabelRequired)).toBeVisible();
  });

  it("should be empty by default", () => {
    render(<FormBase schema={stringFieldSchema} />);
    const input = screen.getByLabelText(stringLabelRequired);
    expect(input).toHaveValue("");
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
        formData={{ numberTestField: 123 }}
      />,
    );

    const input = screen.getByLabelText(numberLabelRequired);
    expect(input).toHaveValue("123");
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
    await userEvent.type(input, "test");
    expect(input).toHaveValue("");

    await userEvent.clear(input);

    // Should allow numbers
    await userEvent.type(input, "123");
    expect(input).toHaveValue("123");
  });

  it("should not allow entering commas in a number field", async () => {
    render(<FormBase schema={numberFieldSchema} />);
    const input = screen.getByLabelText(numberLabelRequired);

    await userEvent.type(input, "1,000,000");
    expect(input).toHaveValue("1,000,000");
  });

  it("should not allow entering numbers greater than the default max value", async () => {
    render(<FormBase schema={numberFieldSchema} />);

    const maxNumDbLimit = 2147483647;

    const input = screen.getByLabelText(numberLabelRequired);

    await userEvent.type(input, (maxNumDbLimit + 1).toString());
    await userEvent.tab();

    // It should not allow entering a number greater than the default max value
    expect(input).toHaveValue("2,147,483,648");

    await userEvent.clear(input);

    // It should allow entering the exact max value
    await userEvent.type(input, maxNumDbLimit.toString());

    expect(input).toHaveValue(maxNumDbLimit.toString());

    await userEvent.clear(input);
  });

  it("should not allow entering numbers greater than the max value set in the uiSchema", async () => {
    render(
      <FormBase
        schema={numberFieldSchema}
        uiSchema={numberFieldUiSchemaWithMax}
      />,
    );

    const input = screen.getByLabelText(numberLabelRequired);

    // Max in the schema is set to 10
    await userEvent.type(input, "11");

    expect(input).toHaveValue("11");

    await userEvent.clear(input);

    // It should allow entering the exact max value
    await userEvent.type(input, "10");

    expect(input).toHaveValue("10");
  });

  it("should not trigger validation for a string value when the value is valid", async () => {
    render(
      <FormBase
        schema={stringFieldSchema}
        formData={{ stringTestField: "test!123" }}
      />,
    );
    await checkNoValidationErrorIsTriggered();
  });

  it("should not trigger validation for a number value when the value is valid", async () => {
    render(
      <FormBase
        schema={numberFieldSchema}
        formData={{ numberTestField: 123 }}
      />,
    );

    await checkNoValidationErrorIsTriggered();
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
});
