import { userEvent } from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import { RJSFSchema } from "@rjsf/utils";
import FormBase from "@bciers/components/form/FormBase";
import {
  checkNoValidationErrorIsTriggered,
  checkTextWidgetValidationStyles,
} from "@bciers/testConfig/helpers/form";

const postalCodeFieldLabel = "Postal code test field";
const postalCodeLabelRequired = `${postalCodeFieldLabel}*`;
const postalCode = "A1B 2C3";

const postalCodeFieldSchema = {
  type: "object",
  required: ["postalCodeTestField"],
  properties: {
    postalCodeTestField: {
      type: "string",
      title: postalCodeFieldLabel,
      format: "postal-code",
    },
  },
} as RJSFSchema;

const postalCodeFieldUiSchema = {
  postalCodeTestField: {
    "ui:widget": "PostalCodeWidget",
  },
};

describe("RJSF PostalCodeWidget", () => {
  it("should render a postal code field", async () => {
    render(
      <FormBase
        schema={postalCodeFieldSchema}
        uiSchema={postalCodeFieldUiSchema}
      />,
    );
    expect(screen.getByLabelText(postalCodeLabelRequired)).toBeVisible();
  });

  it("should be empty by default", async () => {
    render(
      <FormBase
        schema={postalCodeFieldSchema}
        uiSchema={postalCodeFieldUiSchema}
      />,
    );

    const input = screen.getByLabelText(postalCodeLabelRequired);

    expect(input).toHaveValue("");
  });

  it("should render the postal code value when formData is provided", async () => {
    render(
      <FormBase
        schema={postalCodeFieldSchema}
        formData={{ postalCodeTestField: "A1B2C3" }}
        uiSchema={postalCodeFieldUiSchema}
      />,
    );

    const input = screen.getByLabelText(postalCodeLabelRequired);
    expect(input).toHaveValue(postalCode);
  });

  it("should allow entering a postal code", async () => {
    render(
      <FormBase
        schema={postalCodeFieldSchema}
        uiSchema={postalCodeFieldUiSchema}
      />,
    );
    const input = screen.getByLabelText(postalCodeLabelRequired);
    await userEvent.type(input, postalCode);
    expect(input).toHaveValue(postalCode);
  });

  it("should convert lowercase postal code to uppercase", async () => {
    render(
      <FormBase
        schema={postalCodeFieldSchema}
        uiSchema={postalCodeFieldUiSchema}
      />,
    );
    const input = screen.getByLabelText(postalCodeLabelRequired);
    await userEvent.type(input, "a1b 2c3");
    expect(input).toHaveValue(postalCode);
  });

  it("should allow entering a postal code with no spaces", async () => {
    render(
      <FormBase
        schema={postalCodeFieldSchema}
        uiSchema={postalCodeFieldUiSchema}
      />,
    );
    const input = screen.getByLabelText(postalCodeLabelRequired);
    await userEvent.type(input, "A1B2C3");
    expect(input).toHaveValue(postalCode);
  });

  it("should trigger validation error for required field", async () => {
    render(
      <FormBase
        schema={postalCodeFieldSchema}
        uiSchema={postalCodeFieldUiSchema}
      />,
    );
    const submitButton = screen.getByRole("button", { name: "Submit" });

    await userEvent.click(submitButton);

    expect(screen.getByText(/^.* is required/i)).toBeVisible();
  });

  it("should trigger validation error for invalid postal code", async () => {
    render(
      <FormBase
        schema={postalCodeFieldSchema}
        uiSchema={postalCodeFieldUiSchema}
      />,
    );
    const input = screen.getByLabelText(postalCodeLabelRequired);
    await userEvent.type(input, "A1B2CC");

    const submitButton = screen.getByRole("button", { name: "Submit" });

    await userEvent.click(submitButton);

    expect(screen.getByText("Postal code format is A1A 1A1")).toBeVisible();
  });

  it("should not trigger validation error for valid postal code", async () => {
    render(
      <FormBase
        schema={postalCodeFieldSchema}
        uiSchema={postalCodeFieldUiSchema}
      />,
    );
    const input = screen.getByLabelText(postalCodeLabelRequired);
    await userEvent.type(input, postalCode);

    await checkNoValidationErrorIsTriggered();
  });

  it("should have the correct styling when validation is triggered", async () => {
    await checkTextWidgetValidationStyles(
      <FormBase
        schema={postalCodeFieldSchema}
        uiSchema={postalCodeFieldUiSchema}
      />,
      postalCodeLabelRequired,
      "A1B2CC",
    );
  });
});
