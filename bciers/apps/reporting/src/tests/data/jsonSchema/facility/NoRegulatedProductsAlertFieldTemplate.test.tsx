import NoRegulatedProductsAlertContent from "@reporting/src/data/jsonSchema/facility/NoRegulatedProductsAlertFieldTemplate";
import Form from "@rjsf/core";
import { RJSFSchema, UiSchema } from "@rjsf/utils";
import { render, screen } from "@testing-library/react";

const schema: RJSFSchema = {
  type: "object",
  properties: {
    no_regulated_products_alert: {
      type: "object",
      readOnly: true,
    },
  },
};

const uiSchema: UiSchema = {
  no_regulated_products_alert: {
    "ui:FieldTemplate": NoRegulatedProductsAlertContent,
  },
};

describe("The No Regulated Products Alert", () => {
  it("renders links to the activities information page", () => {
    render(
      <Form
        schema={schema}
        uiSchema={uiSchema}
        validator={{} as any}
        formData={{}}
        formContext={{
          no_regulated_products_alert: {
            report_version_id: 123,
          },
        }}
      />,
    );

    const links = screen.getAllByRole("link", {
      name: "Review Operation Information",
    });

    for (const link of links) {
      expect(link.href).toMatch("/reports/123/review-operation-information");
    }
  });
});
