import { render } from "@testing-library/react";
import { RJSFSchema } from "@rjsf/utils";
import FormBase from "@bciers/components/form/FormBase";
import ReadOnlyCurrencyWidget from "./ReadOnlyCurrencyWidget";

// 🔧 Constants
const currencyWidgetLabel = "Amount Due";
const currencyTestValue = 1234.56;
const defaultFormContext = {};

// ✅ Test schemas
const currencyWidgetSchema: RJSFSchema = {
  type: "object",
  properties: {
    currencyTestField: {
      type: "number",
      title: currencyWidgetLabel,
    },
  },
};

const currencyWidgetUiSchema = {
  currencyTestField: {
    "ui:widget": ReadOnlyCurrencyWidget,
  },
};

describe("RJSF ReadOnlyCurrencyWidget", () => {
  it("should render a formatted CAD amount", () => {
    const { container } = render(
      <FormBase
        schema={currencyWidgetSchema}
        uiSchema={currencyWidgetUiSchema}
        formData={{
          currencyTestField: currencyTestValue,
        }}
        formContext={defaultFormContext}
      />,
    );

    const readOnlyWidget = container.querySelector("#root_currencyTestField");
    expect(readOnlyWidget).toBeVisible();
    expect(readOnlyWidget).toHaveTextContent("$1,234.56");
  });

  it("should render $0.00 when no value is provided", () => {
    const { container } = render(
      <FormBase
        schema={currencyWidgetSchema}
        uiSchema={currencyWidgetUiSchema}
        formContext={defaultFormContext}
      />,
    );

    const readOnlyWidget = container.querySelector("#root_currencyTestField");
    expect(readOnlyWidget).toBeVisible();
    expect(readOnlyWidget).toHaveTextContent("$0.00");
  });

  it("should render a negative CAD amount", () => {
    const { container } = render(
      <FormBase
        schema={currencyWidgetSchema}
        uiSchema={currencyWidgetUiSchema}
        formData={{
          currencyTestField: -99.99,
        }}
        formContext={defaultFormContext}
      />,
    );

    const readOnlyWidget = container.querySelector("#root_currencyTestField");
    expect(readOnlyWidget).toBeVisible();
    expect(readOnlyWidget).toHaveTextContent("-$99.99");
  });
});
