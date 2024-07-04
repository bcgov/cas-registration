import { render } from "@testing-library/react";
import FormBase from "@bciers/components/form/FormBase";
import { comboBoxFieldSchema, comboBoxFieldUiSchema } from "../ComboBox.test";

describe("RJSF ReadOnlyComboBoxWidget", () => {
  it("should render a combo box field when formData is provided", async () => {
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
