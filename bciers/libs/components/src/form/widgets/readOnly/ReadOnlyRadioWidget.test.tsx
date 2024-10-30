import { render } from "@testing-library/react";
import { RJSFSchema } from "@rjsf/utils";
import FormBase from "@bciers/components/form/FormBase";

const radioFieldSchema = {
  type: "object",
  properties: {
    radioTestField: { type: "boolean", title: "radio test field" },
  },
} as RJSFSchema;

const radioFieldUiSchema = {
  radioTestField: {
    "ui:widget": "RadioWidget",
  },
};

describe("RJSF ReadOnlyRadioWidget", () => {
  it("should render the correct value when the field is true", () => {
    const { container } = render(
      <FormBase
        disabled
        formData={{
          radioTestField: true,
        }}
        schema={radioFieldSchema}
        uiSchema={radioFieldUiSchema}
      />,
    );

    const readOnlyRadioWidget = container.querySelector("#root_radioTestField");
    expect(readOnlyRadioWidget).toBeVisible();
    expect(readOnlyRadioWidget).toHaveTextContent("Yes");
  });

  it("should render the correct value when the field is false", () => {
    const { container } = render(
      <FormBase
        disabled
        formData={{
          radioTestField: false,
        }}
        schema={radioFieldSchema}
        uiSchema={radioFieldUiSchema}
      />,
    );

    const readOnlyRadioWidget = container.querySelector("#root_radioTestField");
    expect(readOnlyRadioWidget).toBeVisible();
    expect(readOnlyRadioWidget).toHaveTextContent("No");
  });

  it("should render the customized value if passed", () => {
    const { container } = render(
      <FormBase
        disabled
        formData={{
          radioTestField: true,
        }}
        schema={radioFieldSchema}
        uiSchema={{
          radioTestField: {
            "ui:widget": "RadioWidget",
            "ui:options": {
              customizedValue: "Customized value",
            },
          },
        }}
      />,
    );

    const readOnlyRadioWidget = container.querySelector("#root_radioTestField");
    expect(readOnlyRadioWidget).toBeVisible();
    expect(readOnlyRadioWidget).toHaveTextContent("Customized value");
  });
  it("should render the value if no customized value proved and value is not boolean", () => {
    const { container } = render(
      <FormBase
        disabled
        formData={{
          radioTestField: "test",
        }}
        schema={radioFieldSchema}
        uiSchema={radioFieldUiSchema}
      />,
    );

    const readOnlyRadioWidget = container.querySelector("#root_radioTestField");
    expect(readOnlyRadioWidget).toBeVisible();
    expect(readOnlyRadioWidget).toHaveTextContent("test");
  });
});
