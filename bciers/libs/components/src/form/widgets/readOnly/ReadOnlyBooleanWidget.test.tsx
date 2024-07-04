import { render } from "@testing-library/react";
import { RJSFSchema } from "@rjsf/utils";
import FormBase from "@bciers/components/form/FormBase";

const booleanFieldSchema = {
  type: "object",
  properties: {
    booleanTestField: { type: "boolean", title: "Boolean test field" },
  },
} as RJSFSchema;

const booleanFieldUiSchema = {
  booleanTestField: {
    "ui:widget": "RadioWidget",
  },
};

describe("RJSF ReadOnlyBooleanWidget", () => {
  it("should render the correct value when the field is true", () => {
    const { container } = render(
      <FormBase
        disabled
        formData={{
          booleanTestField: true,
        }}
        schema={booleanFieldSchema}
        uiSchema={booleanFieldUiSchema}
      />,
    );

    const readOnlyBooleanWidget = container.querySelector(
      "#root_booleanTestField",
    );
    expect(readOnlyBooleanWidget).toBeVisible();
    expect(readOnlyBooleanWidget).toHaveTextContent("Yes");
  });

  it("should render the correct value when the field is false", () => {
    const { container } = render(
      <FormBase
        disabled
        formData={{
          booleanTestField: false,
        }}
        schema={booleanFieldSchema}
        uiSchema={booleanFieldUiSchema}
      />,
    );

    const readOnlyBooleanWidget = container.querySelector(
      "#root_booleanTestField",
    );
    expect(readOnlyBooleanWidget).toBeVisible();
    expect(readOnlyBooleanWidget).toHaveTextContent("No");
  });

  it("should work for CheckboxWidget fields", () => {
    const checkboxUiSchema = {
      booleanTestField: {
        "ui:widget": "CheckboxWidget",
      },
    };

    const { container } = render(
      <FormBase
        disabled
        formData={{
          booleanTestField: true,
        }}
        schema={booleanFieldSchema}
        uiSchema={checkboxUiSchema}
      />,
    );

    const readOnlyBooleanWidget = container.querySelector(
      "#root_booleanTestField",
    );

    expect(readOnlyBooleanWidget).toBeVisible();
    expect(readOnlyBooleanWidget).toHaveTextContent("Yes");
  });
});
