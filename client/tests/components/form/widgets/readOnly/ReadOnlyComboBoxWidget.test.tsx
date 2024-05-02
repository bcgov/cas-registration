import { render } from "@testing-library/react";
import { RJSFSchema } from "@rjsf/utils";
import FormBase from "@/app/components/form/FormBase";

const comboBoxFieldLabel = "ComboBox test field";

const comboBoxFieldSchema = {
  type: "object",
  properties: {
    comboBoxTestField: {
      type: "string",
      title: comboBoxFieldLabel,
      anyOf: [
        { const: "option_1", title: "Option 1" },
        { const: "option_2", title: "Option 2" },
        { const: "option_3", title: "Option 3" },
      ],
    },
  },
} as RJSFSchema;

const comboBoxFieldUiSchema = {
  comboBoxTestField: {
    "ui:widget": "ComboBox",
  },
};

describe("RJSF ReadOnlyComboBoxWidget", () => {
  it("should render a combo box field", async () => {
    const { container } = render(
      <FormBase
        disabled
        schema={comboBoxFieldSchema}
        uiSchema={comboBoxFieldUiSchema}
        formData={{ comboBoxTestField: "option_2" }}
      />,
    );

    const readOnlyComboBoxWidget = container.querySelector(
      "#root_comboBoxTestField",
    );

    expect(readOnlyComboBoxWidget).toBeVisible();
    expect(readOnlyComboBoxWidget).toHaveTextContent("Option 2");
  });

  it("should be empty when no value is provided", async () => {
    const { container } = render(
      <FormBase
        disabled
        schema={comboBoxFieldSchema}
        uiSchema={comboBoxFieldUiSchema}
      />,
    );

    const readOnlyComboBoxWidget = container.querySelector(
      "#root_comboBoxTestField",
    );

    expect(readOnlyComboBoxWidget).toBeVisible();
    expect(readOnlyComboBoxWidget).toBeEmptyDOMElement();
  });
});
