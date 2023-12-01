import { RJSFSchema } from "@rjsf/utils";
import FieldTemplate from "@/app/styles/rjsf/FieldTemplate";
import FieldTemplateWithSubmitButton from "@/app/styles/rjsf/FieldTemplateWithSubmitButton";

export const selectOperatorSchema: RJSFSchema = {
  type: "object",
  required: ["search_type", "search_value"],
  properties: {
    search_type: {
      type: "string",
      anyOf: [
        { title: "Search by Business Legal Name", const: "name" },
        {
          title: "Search by Canada Revenue Agency (CRA) Business Number",
          const: "cra",
        },
      ],
      default: "name",
    },
  },
  allOf: [
    {
      if: {
        properties: {
          search_type: {
            const: "name",
          },
        },
      },
      then: {
        required: ["search_by_name"],
        properties: {
          search_by_name: {
            type: "string",
            minLength: 1,
            maxLength: 100,
          },
        },
      },
      else: {
        required: ["search_by_cra"],
        properties: {
          search_by_cra: {
            type: "string",
            minLength: 1,
            maxLength: 100,
          },
        },
      },
    },
  ],
};

export const selectOperatorUiSchema = {
  "ui:order": ["search_type", "search_by_name", "search_by_cra"],
  "ui:FieldTemplate": FieldTemplate,
  search_type: {
    "ui:FieldTemplate": FieldTemplate,
    "ui:widget": "RadioWidget",
    "ui:options": {
      hideLabel: true,
      inline: false,
    },
  },
  search_by_name: {
    "ui:FieldTemplate": FieldTemplateWithSubmitButton,
    "ui:widget": "TextWidget",
    "ui:placeholder": "Enter Business Legal Name",
    "ui:classNames": "mt-10",
    "ui:options": {
      hideLabel: true,
      buttonLabel: "Search Operator",
    },
  },
  search_by_cra: {
    "ui:FieldTemplate": FieldTemplateWithSubmitButton,
    "ui:classNames": "mt-10",
    "ui:widget": "TextWidget",
    "ui:placeholder": "Enter CRA Business Number",
    "ui:options": {
      hideLabel: true,
      buttonLabel: "Search Operator",
    },
  },
};
