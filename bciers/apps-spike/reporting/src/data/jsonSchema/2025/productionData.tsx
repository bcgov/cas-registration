import {
  ArrayFieldTemplate,
  FieldTemplate,
  TitleOnlyFieldTemplate,
} from "@bciers/components/form/fields";
import { ReadOnlyWidget } from "@bciers/components/form/widgets/readOnly";
import { RJSFSchema, UiSchema } from "@rjsf/utils";
import { ProductionDataTitleWidget } from "@reporting/src/data/jsonSchema/commonSchema/productionDataTitleWidget";

export const buildProductionDataSchema2025 = (
  compliance_period_start: string,
  compliance_period_end: string,
  product_selection: string[],
  facility_type: string,
  is_opted_out: boolean,
) => {
  const productionMethodology = ["Small Aggregate", "Medium Facility"].includes(
    facility_type,
  )
    ? ["Not Applicable", "OBPS Calculator", "other"]
    : ["OBPS Calculator", "other"];

  const schema = {
    type: "object",
    title: "Production Data",
    properties: {
      product_selection_title: {
        title: "Select the products that apply to this facility:",
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
        required: ["annual_production", "production_methodology"],
        properties: {
          product_id: {
            type: "number",
            minimum: 0,
          },
          product_name: {
            title: "Name",
            type: "string",
            default: "custom value",
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
          production_methodology: {
            title: "Production Quantification Methodology",
            type: "string",
            enum: productionMethodology,
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
        dependencies: {
          is_opted_out: ["production_data_jan_mar"],
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
  } as RJSFSchema;

  // conditionally add Jan-Mar production data field for opted-out operations
  if (is_opted_out) {
    const productionDataItem = schema.definitions
      ?.productionDataItem as RJSFSchema;

    // protection in case productionDataItem is undefined
    productionDataItem.properties ??= {};
    productionDataItem.required ??= [];

    productionDataItem.properties.production_data_jan_mar = {
      title: "Production data for Jan 1 - Mar 31, 2025",
      type: "number",
      minimum: 0,
    };
    productionDataItem.required!.push("production_data_jan_mar");
  }

  return schema;
};

export const productionDataUiSchema2025 = (isOptedOut: boolean): UiSchema => ({
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
        ...(isOptedOut ? ["production_data_jan_mar"] : []),
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
});
