import { render } from "@testing-library/react";
import { RJSFSchema } from "@rjsf/utils";
import FormBase from "@/app/components/form/FormBase";

const stringFieldSchema = {
  type: "object",
  properties: {
    stringTestField: { type: "string", title: "String test field" },
  },
} as RJSFSchema;

const numberFieldSchema = {
  type: "object",
  properties: {
    numberTestField: { type: "number", title: "Number test field" },
  },
} as RJSFSchema;

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
});
