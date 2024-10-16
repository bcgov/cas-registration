import {
  ArrayFieldTemplate,
  FieldTemplate,
  TitleOnlyFieldTemplate,
} from "@bciers/components/form/fields";
import { ReadOnlyWidget } from "@bciers/components/form/widgets/readOnly";
import { RJSFSchema, UiSchema } from "@rjsf/utils";

export const buildProductionDataSchema = (
  compliance_period_start: string,
  compliance_period_end: string,
  product_selection: string[],
) =>
  ({
    type: "object",
    title: "Production Data",
    properties: {
      product_selection_title: {
        title: "Products that apply to this facility",
        type: "string",
      },
      product_selection: {
        type: "array",
        items: {
          type: "string",
          enum: product_selection,
        },
        uniqueItems: true,
      },
      production_data: {
        type: "array",
        title: "Things!",
        items: {
          $ref: "#/definitions/productionDataItem",
        },
      },
    },

    definitions: {
      productionDataItem: {
        type: "object",
        required: ["annual_production", "production_methodology"],
        properties: {
          id: {
            title: "id",
            type: "number",
          },
          name: {
            title: "Name",
            type: "string",
          },
          units: {
            title: "Units",
            type: "string",
          },
          annual_production: {
            title: "Annual Production",
            type: "number",
          },
          production_data_apr_dec: {
            title: "Production data for Apr 1 - Dec 31, 2024",
            type: "number",
          },
          production_methodology: {
            title: "Production Methodology",
            type: "string",
          },
          storage_quantity_start_of_period: {
            title: `Quantity in storage at the beginning of the compliance period [${compliance_period_start}], if applicable`,
            type: "string",
          },
          storage_quantity_end_of_period: {
            title: `Quantity in storage at the beginning of the compliance period [${compliance_period_end}], if applicable`,
            type: "string",
          },
          quantity_sold_during_period: {
            title: `Quantity sold during compliance period [${compliance_period_start} - ${compliance_period_end}], if applicable`,
            type: "string",
          },
          quantity_throughput_during_period: {
            title: `Quantity of throughput at point of sale during compliance period [${compliance_period_start} - ${compliance_period_end}], if applicable`,
            type: "string",
          },
        },
      },
    },
  }) as RJSFSchema;

export const productionDataUiSchema: UiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  product_selection_title: {
    "ui:FieldTemplate": TitleOnlyFieldTemplate,
    "ui:classNames": "mt-2 mb-5",
  },
  product_selection: {
    "ui:widget": "checkboxes",
    "ui:options": {
      label: false,
    },
  },
  production_data: {
    "ui:FieldTemplate": FieldTemplate,
    "ui:ArrayFieldTemplate": ArrayFieldTemplate,
    "ui:options": {
      label: false,
      addable: false,
      removable: false,
    },
    items: {
      id: {
        "ui:widget": "hidden",
      },
      name: {
        "ui:widget": ReadOnlyWidget,
        "ui:options": {
          label: false,
        },
      },
      units: {
        "ui:widget": ReadOnlyWidget,
      },
    },
  },
};
