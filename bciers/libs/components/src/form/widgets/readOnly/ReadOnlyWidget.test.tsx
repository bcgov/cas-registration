import { render } from "@testing-library/react";
import FormBase from "@bciers/components/form/FormBase";
import { stringFieldSchema, numberFieldSchema } from "../TextWidget.test";

describe("RJSF ReadOnlyWidget", () => {
  it("should render a string value", () => {
    const { container } = render(
      <FormBase
        disabled
        formData={{
          stringTestField: "test string",
        }}
        schema={stringFieldSchema}
      />,
    );

    const readOnlyWidget = container.querySelector("#root_stringTestField");
    expect(readOnlyWidget).toBeVisible();
    expect(readOnlyWidget).toHaveTextContent("test string");
  });

  it("should render a number value", () => {
    const { container } = render(
      <FormBase
        disabled
        formData={{
          numberTestField: 42,
        }}
        schema={numberFieldSchema}
      />,
    );

    const readOnlyWidget = container.querySelector("#root_numberTestField");
    expect(readOnlyWidget).toBeVisible();
    expect(readOnlyWidget).toHaveTextContent("42");
  });

  it("should be empty when no value is provided", () => {
    const { container } = render(
      <FormBase disabled schema={stringFieldSchema} />,
    );

    const readOnlyWidget = container.querySelector("#root_stringTestField");
    expect(readOnlyWidget).toBeEmptyDOMElement();
  });

  it("should render an array value", () => {
    const { container } = render(
      <FormBase
        disabled
        formData={{
          arrayTestField: ["test1", "test2"],
        }}
        schema={{
          properties: {
            arrayTestField: {
              type: "array",
              items: {
                type: "string",
              },
            },
          },
        }}
        uiSchema={{
          arrayTestField: {
            "ui:widget": "ReadOnlyWidget",
          },
        }}
      />,
    );

    const readOnlyWidget = container.querySelector("#root_arrayTestField");
    expect(readOnlyWidget).toBeVisible();
    expect(readOnlyWidget).toHaveTextContent("test1, test2");
  });
});
