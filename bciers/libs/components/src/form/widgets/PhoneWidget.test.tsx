import { userEvent } from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import { RJSFSchema } from "@rjsf/utils";
import FormBase from "@bciers/components/form/FormBase";
import {
  checkNoValidationErrorIsTriggered,
  checkTextWidgetValidationStyles,
} from "@bciers/testConfig/helpers/form";

const phoneWidgetLabel = "PhoneWidget test field";
const phoneRequiredLabel = `${phoneWidgetLabel}*`;
const databaseTelephone = "+17785678901";

const phoneWidgetSchema = {
  type: "object",
  required: ["phoneTestField"],
  properties: {
    phoneTestField: {
      type: "string",
      title: phoneWidgetLabel,
      format: "phone",
    },
  },
} as RJSFSchema;

const phoneWidgetUiSchema = {
  phoneTestField: {
    "ui:widget": "PhoneWidget",
  },
};

describe("RJSF PhoneWidget", () => {
  it("should render the phone field", async () => {
    render(
      <FormBase schema={phoneWidgetSchema} uiSchema={phoneWidgetUiSchema} />,
    );
    expect(screen.getByLabelText(phoneRequiredLabel)).toBeVisible();
  });

  it("should be empty by default", async () => {
    render(
      <FormBase schema={phoneWidgetSchema} uiSchema={phoneWidgetUiSchema} />,
    );

    const phoneField = screen.getByLabelText(phoneRequiredLabel);

    expect(phoneField).toHaveValue("");
  });

  it("should render the phone value when formData is provided", async () => {
    render(
      <FormBase
        schema={phoneWidgetSchema}
        uiSchema={phoneWidgetUiSchema}
        formData={{ phoneTestField: databaseTelephone }}
      />,
    );

    const phoneField = screen.getByLabelText(phoneRequiredLabel);
    expect(phoneField).toHaveValue("778 567 8901");
  });

  it("should allow only numbers in the phone field", async () => {
    render(
      <FormBase schema={phoneWidgetSchema} uiSchema={phoneWidgetUiSchema} />,
    );
    const phoneField = screen.getByLabelText(phoneRequiredLabel);
    await userEvent.type(phoneField, "+1-250-555-BUGS");
    expect(phoneField).toHaveValue("1 250 555");
  });

  it("should display the Canadian flag by default", async () => {
    render(
      <FormBase schema={phoneWidgetSchema} uiSchema={phoneWidgetUiSchema} />,
    );

    expect(screen.getByTestId("CA")).toBeVisible();
  });

  it("should display the Canadian flag when a Canadian number is displayed", async () => {
    render(
      <FormBase
        schema={phoneWidgetSchema}
        uiSchema={phoneWidgetUiSchema}
        formData={{ phoneTestField: databaseTelephone }}
      />,
    );

    expect(screen.getByTestId("CA")).toBeVisible();
  });

  it("should display the US flag when an American number is displayed", async () => {
    render(
      <FormBase
        schema={phoneWidgetSchema}
        uiSchema={phoneWidgetUiSchema}
        formData={{ phoneTestField: "+12345678901" }}
      />,
    );

    expect(screen.getByTestId("US")).toBeVisible();
  });

  it("should allow submission of a valid value", async () => {
    render(
      <FormBase
        schema={phoneWidgetSchema}
        uiSchema={phoneWidgetUiSchema}
        formData={{ phoneTestField: databaseTelephone }} // Mexico number
      />,
    );

    await checkNoValidationErrorIsTriggered();
  });
  it("should not allow submission of phone numbers from countries other than CA or US", async () => {
    render(
      <FormBase
        schema={phoneWidgetSchema}
        uiSchema={phoneWidgetUiSchema}
        formData={{ phoneTestField: "55-5724-7900" }} // Mexico number
      />,
    );

    const submitButton = screen.getByRole("button", { name: "Submit" });
    await userEvent.click(submitButton);

    expect(screen.getByText("Format should be ### ### ####")).toBeVisible(); //TODO: if we add a more accurate error for this case, update test
  });

  it("should display the error message when the phone field is required but empty", async () => {
    render(
      <FormBase schema={phoneWidgetSchema} uiSchema={phoneWidgetUiSchema} />,
    );

    const submitButton = screen.getByRole("button", { name: "Submit" });
    await userEvent.click(submitButton);

    expect(screen.getByText(/^.* is required/i)).toBeVisible();
  });

  it("should display the error message when the phone field is not a valid phone number", async () => {
    render(
      <FormBase schema={phoneWidgetSchema} uiSchema={phoneWidgetUiSchema} />,
    );

    const phoneField = screen.getByLabelText(phoneRequiredLabel);
    await userEvent.type(phoneField, "1234567890");
    const submitButton = screen.getByRole("button", { name: "Submit" });
    await userEvent.click(submitButton);

    expect(screen.getByText("Format should be ### ### ####")).toBeVisible();
  });

  it("should have the correct styles when the validation is triggered", async () => {
    await checkTextWidgetValidationStyles(
      <FormBase schema={phoneWidgetSchema} uiSchema={phoneWidgetUiSchema} />,
      phoneRequiredLabel,
      "12345678",
    );
  });
});
