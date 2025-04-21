import { userEvent } from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import { RJSFSchema } from "@rjsf/utils";
import FormBase from "@bciers/components/form/FormBase";
import {
  checkNoValidationErrorIsTriggered,
  checkTextWidgetValidationStyles,
} from "@bciers/testConfig/helpers/form";

const emailFieldLabel = "Email test field";
const emailLabelRequired = `${emailFieldLabel}*`;
const testEmail = "test@email.com";
const emailValidationMessage =
  "Please enter a valid email address, e.g. mail@example.com";

const emailFieldSchema = {
  type: "object",
  required: ["emailTestField"],
  properties: {
    emailTestField: {
      type: "string",
      title: emailFieldLabel,
      format: "email",
    },
  },
} as RJSFSchema;

const emailFieldUiSchema = {
  emailTestField: {
    "ui:widget": "EmailWidget",
  },
};

describe("RJSF EmailWidget", () => {
  it("should render an email field", async () => {
    render(
      <FormBase schema={emailFieldSchema} uiSchema={emailFieldUiSchema} />,
    );
    expect(screen.getByLabelText(emailLabelRequired)).toBeVisible();
  });

  it("should be empty by default", async () => {
    render(
      <FormBase schema={emailFieldSchema} uiSchema={emailFieldUiSchema} />,
    );

    const input = screen.getByLabelText(emailLabelRequired);

    expect(input).toHaveValue("");
  });

  it("should render the email value when formData is provided", async () => {
    render(
      <FormBase
        schema={emailFieldSchema}
        formData={{ emailTestField: testEmail }}
        uiSchema={emailFieldUiSchema}
      />,
    );

    const input = screen.getByLabelText(emailLabelRequired);
    expect(input).toHaveValue(testEmail);
  });

  it("should allow entering an email", async () => {
    render(
      <FormBase schema={emailFieldSchema} uiSchema={emailFieldUiSchema} />,
    );
    const input = screen.getByLabelText(emailLabelRequired);
    await userEvent.type(input, testEmail);

    expect(input).toHaveValue(testEmail);
  });

  it("should trigger validation error for invalid email", async () => {
    render(
      <FormBase schema={emailFieldSchema} uiSchema={emailFieldUiSchema} />,
    );
    const input = screen.getByLabelText(emailLabelRequired);
    await userEvent.type(input, "@example.com");

    const submitButton = screen.getByRole("button", { name: "Submit" });

    await userEvent.click(submitButton);

    expect(screen.getByText(emailValidationMessage)).toBeVisible();
  });

  it("should trigger validation error for required field", async () => {
    render(
      <FormBase schema={emailFieldSchema} uiSchema={emailFieldUiSchema} />,
    );
    const submitButton = screen.getByRole("button", { name: "Submit" });

    await userEvent.click(submitButton);

    expect(screen.getByText(/^.* is required/i)).toBeVisible();
  });

  it("should not trigger validation error for valid email", async () => {
    render(
      <FormBase schema={emailFieldSchema} uiSchema={emailFieldUiSchema} />,
    );
    const input = screen.getByLabelText(emailLabelRequired);
    await userEvent.type(input, testEmail);

    await checkNoValidationErrorIsTriggered();
  });

  it("should not trigger validation error for valid email with a subdomain", async () => {
    render(
      <FormBase schema={emailFieldSchema} uiSchema={emailFieldUiSchema} />,
    );
    const input = screen.getByLabelText(emailLabelRequired);
    await userEvent.type(input, "test@email.test.com");

    await checkNoValidationErrorIsTriggered();
    expect(screen.queryByText(emailValidationMessage)).toBeNull();
  });

  it("should have the correct styling when validation is triggered", async () => {
    await checkTextWidgetValidationStyles(
      <FormBase schema={emailFieldSchema} uiSchema={emailFieldUiSchema} />,
      emailLabelRequired,
      "A1B2CC",
    );
  });
});
