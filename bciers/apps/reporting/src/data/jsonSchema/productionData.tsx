import {
  ArrayFieldTemplate,
  FieldTemplate,
  TitleOnlyFieldTemplate,
} from "@bciers/components/form/fields";
import { ReadOnlyWidget } from "@bciers/components/form/widgets/readOnly";
import { RJSFSchema, UiSchema } from "@rjsf/utils";

export const buildProductionDataSchema: (
  compliance_period_start: string,
  compliance_period_end: string,
) => RJSFSchema = (products, compliance_period_start) => ({
  type: "object",
  title: "Production Data",
  properties: {
    productSelectionTitle: {
      title: "Products that apply to this facility",
      type: "string",
    },
    productSelection: {
      type: "array",
      items: {
        type: "string",
        enum: [],
      },
      uniqueItems: true,
    },
    productionData: {
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
      properties: {
        name: {
          title: "Name",
          type: "string",
        },
        units: {
          title: "Units",
          type: "string",
          readOnly: true,
        },
        annualProduction: {
          title: "Annual Production",
          type: "string",
        },
        productionMethodology: {
          title: "Production Methodology",
          type: "string",
        },
        qtyStorageBeginningOfComplPeriod: {
          title: `Quantity in storage at the beginning of the compliance period (${compliance_period_start}) if applicable`,
          type: "string",
        },
      },
    },
  },
});

export const productionDataUiSchema: UiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  productSelectionTitle: {
    "ui:FieldTemplate": TitleOnlyFieldTemplate,
    "ui:classNames": "mt-2 mb-5",
  },
  productSelection: {
    "ui:widget": "checkboxes",
    "ui:options": {
      label: false,
    },
  },
  productionData: {
    "ui:FieldTemplate": FieldTemplate,
    "ui:ArrayFieldTemplate": ArrayFieldTemplate,
    "ui:options": {
      label: false,
    },
    items: {
      name: {
        "ui:widget": ReadOnlyWidget,
        "ui:options": {
          label: false,
        },
      },
    },
  },
};
