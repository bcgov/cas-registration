import { userEvent } from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import { RJSFSchema } from "@rjsf/utils";
import FormBase from "@/app/components/form/FormBase";
import { checkTextWidgetValidationStyles } from "@/tests/helpers/form";

const postalCodeFieldLabel = "Postal code test field";
const postalCodeLabelRequired = `${postalCodeFieldLabel}*`;

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

  it("should allow entering a postal code", async () => {
    render(
      <FormBase
        schema={postalCodeFieldSchema}
        uiSchema={postalCodeFieldUiSchema}
      />,
    );
    const input = screen.getByLabelText(postalCodeLabelRequired);
    await userEvent.type(input, "A1B 2C3");
    expect(input).toHaveValue("A1B 2C3");
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
    expect(input).toHaveValue("A1B 2C3");
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

    expect(screen.getByText("Required field")).toBeVisible();
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

    expect(screen.getByText("Format should be A1A 1A1")).toBeVisible();
  });

  it("should not trigger validation error for valid postal code", async () => {
    render(
      <FormBase
        schema={postalCodeFieldSchema}
        uiSchema={postalCodeFieldUiSchema}
      />,
    );
    const input = screen.getByLabelText(postalCodeLabelRequired);
    await userEvent.type(input, "A1B 2C3");

    const submitButton = screen.getByRole("button", { name: "Submit" });

    await userEvent.click(submitButton);

    expect(screen.queryByText("Format should be A1A 1A1")).toBeNull();
  });

  it("should have the correct styling when validation is triggered", async () => {
    checkTextWidgetValidationStyles(
      <FormBase
        schema={postalCodeFieldSchema}
        uiSchema={postalCodeFieldUiSchema}
      />,
      postalCodeLabelRequired,
      "A1B2CC",
    );
  });
});
