import { userEvent } from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import { RJSFSchema } from "@rjsf/utils";
import FormBase from "@/app/components/form/FormBase";

const radioFieldLabel = "RadioWidget test field";

const radioFieldSchema = {
  type: "object",
  properties: {
    radioTestField: {
      type: "boolean",
      title: radioFieldLabel,
      default: false,
    },
  },
} as RJSFSchema;

const radioFieldUiSchema = {
  radioTestField: {
    "ui:widget": "RadioWidget",
  },
};

describe("RJSF RadioWidget", () => {
  it("should render a radio field", async () => {
    render(
      <FormBase schema={radioFieldSchema} uiSchema={radioFieldUiSchema} />,
    );
    expect(screen.getByText(radioFieldLabel)).toBeVisible();
  });

  it("should have a default checked value", async () => {
    render(
      <FormBase schema={radioFieldSchema} uiSchema={radioFieldUiSchema} />,
    );

    expect(screen.getByLabelText("No")).toBeChecked();
  });

  it("should display the checked value when formData is provided", async () => {
    render(
      <FormBase
        schema={radioFieldSchema}
        formData={{ radioTestField: true }}
        uiSchema={radioFieldUiSchema}
      />,
    );

    expect(screen.getByLabelText("Yes")).toBeChecked();
  });

  it("should allow selecting a radio value", async () => {
    render(
      <FormBase schema={radioFieldSchema} uiSchema={radioFieldUiSchema} />,
    );

    const optionYes = screen.getByLabelText("Yes");
    const optionNo = screen.getByLabelText("No");

    expect(optionNo).toBeChecked();

    await userEvent.click(optionYes);
    expect(optionYes).toBeChecked();
    expect(optionNo).not.toBeChecked();
  });

  it("should support multiple options", async () => {
    const multiSchema = {
      type: "object",
      properties: {
        radioTestField: {
          type: "string",
          title: "Multi test field",
          anyOf: [
            {
              title: "Yessss",
              const: "yes",
            },
            {
              title: "Nooooo",
              const: "no",
            },
            {
              title: "Maybe",
              const: "maybe",
            },
          ],
        },
      },
    } as RJSFSchema;

    render(<FormBase schema={multiSchema} uiSchema={radioFieldUiSchema} />);

    const optionYes = screen.getByLabelText("Yessss");
    const optionNo = screen.getByLabelText("Nooooo");
    const optionMaybe = screen.getByLabelText("Maybe");

    await userEvent.click(optionNo);

    expect(optionYes).not.toBeChecked();
    expect(optionNo).toBeChecked();
    expect(optionMaybe).not.toBeChecked();
  });
});
