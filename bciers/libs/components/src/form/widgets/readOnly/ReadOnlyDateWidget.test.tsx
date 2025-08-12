import { render } from "@testing-library/react";
import FormBase from "@bciers/components/form/FormBase";
import { RJSFSchema, UiSchema } from "@rjsf/utils";

export const dateWidgetFieldSchema: RJSFSchema = {
  type: "object",
  properties: {
    dateWidgetTestField: {
      type: "string",
      title: "Date widget test field",
    },
  },
};

export const dateWidgetFieldUiSchema: UiSchema = {
  dateWidgetTestField: {
    "ui:widget": "DateWidget",
  },
};

const dateString = "2024-07-05T09:00:00.000Z";

describe("RJSF ReadOnlyWidget", () => {
  it("should render a string value", () => {
    const { container } = render(
      <FormBase
        disabled
        formData={{
          dateWidgetTestField: dateString,
        }}
        schema={dateWidgetFieldSchema}
        uiSchema={dateWidgetFieldUiSchema}
      />,
    );

    const dateWidget = container.querySelector("#root_dateWidgetTestField");
    expect(dateWidget).toBeVisible();
    expect(dateWidget).toHaveTextContent("Jul 05, 2024");
  });

  it("should be empty when no value is provided", () => {
    const { container } = render(
      <FormBase
        disabled
        schema={dateWidgetFieldSchema}
        uiSchema={dateWidgetFieldUiSchema}
      />,
    );

    const dateWidget = container.querySelector("#root_dateWidgetTestField");
    expect(dateWidget).toBeEmptyDOMElement();
  });

  it("should be empty when an invalid date is provided", () => {
    const { container } = render(
      <FormBase
        disabled
        formData={{
          dateWidgetTestField: "invalid date",
        }}
        schema={dateWidgetFieldSchema}
        uiSchema={dateWidgetFieldUiSchema}
      />,
    );

    const dateWidget = container.querySelector("#root_dateWidgetTestField");
    expect(dateWidget).toBeEmptyDOMElement();
  });
});
