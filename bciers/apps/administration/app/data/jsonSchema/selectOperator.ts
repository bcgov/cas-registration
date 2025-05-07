import { RJSFSchema } from "@rjsf/utils";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import FieldTemplateWithSubmitButton from "@bciers/components/form/fields/FieldTemplateWithSubmitButton";

export const selectOperatorSchema: RJSFSchema = {
  type: "object",
  required: ["search_type"],
  properties: {
    search_type: {
      type: "string",
      anyOf: [
        { title: "Search by Business Legal Name", const: "legal_name" },
        {
          title: "Search by Canada Revenue Agency (CRA) Business Number",
          const: "cra_business_number",
        },
      ],
      default: "legal_name",
    },
  },
  allOf: [
    {
      if: {
        properties: {
          search_type: {
            const: "legal_name",
          },
        },
      },
      then: {
        required: ["legal_name"],
        properties: {
          legal_name: {
            title: "Business Legal Name",
            type: "string",
            minLength: 1,
            maxLength: 100,
          },
        },
      },
      else: {
        required: ["cra_business_number"],
        properties: {
          cra_business_number: {
            type: "number",
            minLength: 1,
            maxLength: 100,
          },
        },
      },
    },
  ],
};

export const selectOperatorUiSchema = {
  "ui:order": ["search_type", "legal_name", "cra_business_number"],
  "ui:FieldTemplate": FieldTemplate,
  search_type: {
    "ui:FieldTemplate": FieldTemplate,
    "ui:widget": "RadioWidget",
    "ui:options": {
      label: false,
      inline: false,
    },
  },
  legal_name: {
    "ui:FieldTemplate": FieldTemplateWithSubmitButton,
    "ui:widget": "OperatorSearchWidget",
    "ui:placeholder": "Enter Business Legal Name",

    "ui:options": {
      label: false,
      buttonLabel: "Select Operator",
    },
  },
  cra_business_number: {
    "ui:FieldTemplate": FieldTemplateWithSubmitButton,
    "ui:widget": "TextWidget",
    "ui:placeholder": "Enter CRA Business Number",
    "ui:options": {
      label: false,
      buttonLabel: "Search Operator",
      title: "CRA Business Number",
    },
  },
};
