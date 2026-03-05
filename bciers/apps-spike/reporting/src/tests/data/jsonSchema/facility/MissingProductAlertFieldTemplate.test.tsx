import MissingProductAlertFieldTemplate from "@reporting/src/data/jsonSchema/facility/MissingProductAlertFieldTemplate";
import Form from "@rjsf/core";
import { RJSFSchema, UiSchema } from "@rjsf/utils";
import { render, screen } from "@testing-library/react";

const schema: RJSFSchema = {
  type: "object",
  properties: {
    missing_product_alert: {
      type: "object",
      readOnly: true,
    },
  },
};

const uiSchema: UiSchema = {
  missing_product_alert: {
    "ui:FieldTemplate": MissingProductAlertFieldTemplate,
  },
};

describe("The Missing Product Alert", () => {
  it("renders links to the production data page", () => {
    render(
      <Form
        schema={schema}
        uiSchema={uiSchema}
        validator={{} as any}
        formData={{}}
        formContext={{
          missing_product_alert: {
            version_id: 123,
            facility_id: "abcd",
          },
        }}
      />,
    );

    const links = screen.getAllByRole("link", { name: "production data page" });

    for (const link of links) {
      expect(link.href).toMatch("/reports/123/facilities/abcd/production-data");
    }
  });
});
