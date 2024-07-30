import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import { RJSFSchema, UiSchema } from "@rjsf/utils";

export const registrationPurposeSchema: RJSFSchema = {
  title: "Registration Purpose",
  type: "object",
  properties: {
    registration_purpose: {
      type: "string",
      title: "The purpose of this registration is to register as a:",
      enum: [
        "Reporting Operation",
        "OBPS Regulated Operation",
        "Opted-in Operation",
        "New Entrant Operation",
        "Electricity Import Operation",
        "Potential Reporting Operation",
      ],
    },
  },
  dependencies: {
    registration_purpose: {
      allOf: [
        {
          if: {
            properties: {
              registration_purpose: {
                const: "OBPS Regulated Operation",
              },
            },
          },
          then: {
            properties: {
              regulated_products: {
                type: "array",
                items: {
                  type: "number",
                },
                title: "Reporting Operation",
              },
            },
          },
        },
      ],
    },
  },
};

export const registrationPurposeUiSchema: UiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  registration_purpose: {
    "ui:placeholder": "Select Registration Purpose",
  },
  regulated_products: {
    "ui:widget": "MultiSelectWidget",
    "ui:placeholder": "Select Regulated Product",
  },
};
