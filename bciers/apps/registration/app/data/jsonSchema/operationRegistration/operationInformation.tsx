import { TitleOnlyFieldTemplate } from "@bciers/components/form/fields";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import { RJSFSchema, UiSchema } from "@rjsf/utils";
import {
  operationPreface,
  purposeNote,
  purposePreface,
} from "./operationInformationText";

export const operationInformationSchema: RJSFSchema = {
  title: "Operation Information",
  type: "object",
  required: ["registration_purpose", "operation"],
  properties: {
    purpose_preface: {
      //Not an actual field in the db - this is just to make the form look like the wireframes
      type: "object",
      readOnly: true,
    },
    registration_purpose: {
      type: "string",
      title: "The purpose of this registration is to register as a:",
      anyOf: [],
    },
    purpose_note: {
      //Not an actual field in the db - this is just to make the form look like the wireframes
      type: "object",
      readOnly: true,
    },
    operation_preface: {
      //Not an actual field in the db - this is just to make the form look like the wireframes
      type: "object",
      readOnly: true,
    },
    operation: {
      type: "string",
      title: "Select your operation:",
      anyOf: [],
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
            required: ["regulated_products"],
            properties: {
              regulated_products: {
                type: "array",
                items: {
                  type: "number",
                },
                title: "Regulated Product Name(s):",
              },
            },
          },
        },
        {
          if: {
            properties: {
              registration_purpose: {
                const: "Reporting Operation",
              },
            },
          },
          then: {
            required: ["regulated_products"],
            properties: {
              regulated_products: {
                type: "array",
                items: {
                  type: "number",
                },
                title: "Regulated Product Name(s):",
              },
            },
          },
        },
        {
          if: {
            properties: {
              registration_purpose: {
                const: "New Entrant Operation",
              },
            },
          },
          then: {
            required: ["regulated_products"],
            properties: {
              regulated_products: {
                type: "array",
                items: {
                  type: "number",
                },
                title: "Regulated Product Name(s):",
              },
            },
          },
        },
        {
          if: {
            properties: {
              registration_purpose: {
                const: "Opted-in Operation",
              },
            },
          },
          then: {
            required: ["regulated_products"],
            properties: {
              regulated_products: {
                type: "array",
                items: {
                  type: "number",
                },
                title: "Regulated Product Name(s):",
              },
            },
          },
        },
      ],
    },
  },
};

export const operationInformationUiSchema: UiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  "ui:order": [
    "purpose_preface",
    "registration_purpose",
    "purpose_note",
    "regulated_products",
    "operation_preface",
    "operation",
  ],
  purpose_preface: {
    "ui:FieldTemplate": TitleOnlyFieldTemplate,
    "ui:title": purposePreface,
  },
  registration_purpose: {
    "ui:placeholder": "Select Registration Purpose",
    "ui:widget": "ComboBox",
  },
  purpose_note: {
    "ui:FieldTemplate": TitleOnlyFieldTemplate,
    "ui:title": purposeNote,
  },
  regulated_products: {
    "ui:widget": "MultiSelectWidget",
    "ui:placeholder": "Select Regulated Product",
  },
  operation_preface: {
    "ui:FieldTemplate": TitleOnlyFieldTemplate,
    "ui:title": operationPreface,
  },
  operation: {
    "ui:widget": "ComboBox",
  },
};
