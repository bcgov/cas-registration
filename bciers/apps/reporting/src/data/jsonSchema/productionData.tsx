import {
  ArrayFieldTemplate,
  FieldTemplate,
  TitleOnlyFieldTemplate,
} from "@bciers/components/form/fields";
import { ReadOnlyWidget } from "@bciers/components/form/widgets/readOnly";
import { RJSFSchema, UiSchema } from "@rjsf/utils";
import { ProductionDataTitleWidget } from "@reporting/src/data/jsonSchema/commonSchema/productionDataTitleWidget";

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
        items: {
          $ref: "#/definitions/productionDataItem",
        },
      },
    },

    definitions: {
      productionDataItem: {
        type: "object",
        required: [
          "annual_production",
          "production_data_apr_dec",
          "production_methodology",
        ],
        properties: {
          product_id: {
            type: "number",
            minimum: 0,
          },
          product_name: {
            title: "Name",
            type: "string",
            value: "custom value",
          },
          unit: {
            title: "Unit",
            type: "string",
            readOnly: true,
          },
          annual_production: {
            title: "Annual Production",
            type: "number",
            minimum: 0,
          },
          production_data_apr_dec: {
            title: "Production data for Apr 1 - Dec 31, 2024",
            type: "number",
            minimum: 0,
          },
          production_methodology: {
            title: "Production Quantification Methodology",
            type: "string",
            enum: ["OBPS Calculator", "other"],
            default: "OBPS Calculator",
          },
          storage_quantity_start_of_period: {
            title: `Quantity in storage at the beginning of the compliance period [${compliance_period_start}], if applicable`,
            type: "number",
            minimum: 0,
          },
          storage_quantity_end_of_period: {
            title: `Quantity in storage at the end of the compliance period [${compliance_period_end}], if applicable`,
            type: "number",
            minimum: 0,
          },
          quantity_sold_during_period: {
            title: `Quantity sold during compliance period [${compliance_period_start} - ${compliance_period_end}], if applicable`,
            type: "number",
            minimum: 0,
          },
          quantity_throughput_during_period: {
            title: `Quantity of throughput at point of sale during compliance period [${compliance_period_start} - ${compliance_period_end}], if applicable`,
            type: "number",
            minimum: 0,
          },
        },
        allOf: [
          {
            if: { properties: { production_methodology: { const: "other" } } },
            then: {
              properties: {
                production_methodology_description: {
                  title: "Methodology description",
                  type: "string",
                },
              },
              required: ["production_methodology_description"],
            },
          },
        ],
      },
    },
  }) as RJSFSchema;

export const productionDataUiSchema: UiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  product_selection_title: {
    "ui:FieldTemplate": TitleOnlyFieldTemplate,
    "ui:classNames": "mt-2 mb-5 emission-array-header",
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
      addable: false,
      removable: false,
      label: false,
    },
    items: {
      "ui:order": [
        "product_id",
        "product_name",
        "unit",
        "annual_production",
        "production_data_apr_dec",
        "production_methodology",
        "production_methodology_description",
        "*",
      ],
      product_id: {
        "ui:widget": "hidden",
      },
      product_name: {
        "ui:FieldTemplate": FieldTemplate,
        "ui:widget": ProductionDataTitleWidget,
        "ui:classNames": "emission-array-header",
        "ui:options": {
          label: false,
        },
      },
      unit: {
        "ui:widget": ReadOnlyWidget,
      },
    },
  },
};
