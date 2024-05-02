import { render } from "@testing-library/react";
import { RJSFSchema } from "@rjsf/utils";
import FormBase from "@/app/components/form/FormBase";

const multiSelectFieldSchema = {
  type: "object",
  properties: {
    multiSelectTestField: {
      type: "array",
      title: "MultiSelectWidget test field",
      items: {
        type: "string",
        enum: ["option_1", "option_2", "option_3"],
        enumNames: ["Option 1", "Option 2", "Option 3"],
      },
    },
  },
} as RJSFSchema;

const multiSelectFieldUiSchema = {
  multiSelectTestField: {
    "ui:widget": "MultiSelectWidget",
  },
};

describe("RJSF ReadOnlyMultiSelectWidget", () => {
  it("should render a multi select field", async () => {
    const { container } = render(
      <FormBase
        disabled
        schema={multiSelectFieldSchema}
        uiSchema={multiSelectFieldUiSchema}
        formData={{ multiSelectTestField: ["option_2"] }}
      />,
    );

    const readOnlyMultiSelectWidget = container.querySelector(
      "#root_multiSelectTestField",
    );

    expect(readOnlyMultiSelectWidget).toBeVisible();
    expect(readOnlyMultiSelectWidget).toHaveTextContent("Option 2");
  });

  it("should render multiple values when formData is provided", async () => {
    const { container } = render(
      <FormBase
        disabled
        schema={multiSelectFieldSchema}
        uiSchema={multiSelectFieldUiSchema}
        formData={{
          multiSelectTestField: ["option_1", "option_2", "option_3"],
        }}
      />,
    );

    const readOnlyMultiSelectWidget = container.querySelector(
      "#root_multiSelectTestField",
    );

    expect(readOnlyMultiSelectWidget).toBeVisible();
    expect(readOnlyMultiSelectWidget).toHaveTextContent(
      "Option 1, Option 2, Option 3",
    );
  });

  it("should be empty when no value is provided", async () => {
    const { container } = render(
      <FormBase
        disabled
        schema={multiSelectFieldSchema}
        uiSchema={multiSelectFieldUiSchema}
      />,
    );

    const readOnlyMultiSelectWidget = container.querySelector(
      "#root_multiSelectTestField",
    );

    expect(readOnlyMultiSelectWidget).toBeVisible();
    expect(readOnlyMultiSelectWidget).toHaveTextContent("");
  });
});
