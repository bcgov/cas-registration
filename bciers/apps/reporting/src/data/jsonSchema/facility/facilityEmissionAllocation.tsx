import {
  ArrayFieldTemplate,
  FieldTemplate,
  TitleOnlyFieldTemplate,
} from "@bciers/components/form/fields";
import { ReadOnlyWidget } from "@bciers/components/form/widgets/readOnly";
import { RJSFSchema, UiSchema, WidgetProps } from "@rjsf/utils";

export const emissionAllocationSchema: RJSFSchema = {
  type: "object",
  title: "Allocation of Emissions",
  properties: {
    methodology: {
      type: "string",
      title: "Methodology",
      enum: ["Calculator", "Other"],
    },
    emission_allocation_title: {
      title:
        "Allocation the facility's total emissions by emission category, among its regulated products in tCO2e:",
      type: "string",
    },
    facility_emission_data: {
      type: "array",
      items: {
        $ref: "#/definitions/emissionCategoryAllocationItem",
      },
    },
  },
  dependencies: {
    methodology: {
      oneOf: [
        {
          properties: {
            methodology: {
              enum: ["Other"],
            },
            other_methodology_description: {
              type: "string",
              title: "Details about the methodology",
            },
          },
          required: ["other_methodology_description"],
        },
        {
          properties: {
            methodology: {
              enum: ["Calculator"],
            },
          },
        },
      ],
    },
  },
  definitions: {
    emissionCategoryAllocationItem: {
      type: "object",
      properties: {
        emission_category: {
          title: "Name",
          type: "string",
        },
        emission_total: {
          title: "Total Emissions",
          type: "string",
          readOnly: true,
        },
        products: {
          type: "array",
          items: {
            type: "object",
            properties: {
              product_name: {
                title: "Product Name",
                type: "string",
              },
              product_emission: {
                type: "number",
              },
            },
          },
        },
      },
    },
  },
};

// Custom Field to display the Emission Category
const EmissionAllocationTitleWidget: React.FC<WidgetProps> = ({
  id,
  value,
}) => {
  return (
    <div id={id} className="w-full mt-8">
      <u> {value}</u>
    </div>
  );
};

export const emissionAllocationUiSchema: UiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  "ui:order": [
    "methodology",
    "other_methodology_description",
    "emission_allocation_title",
    "facility_emission_data",
  ],
  methodology: {
    "ui:widget": "SelectWidget",
    "ui:placeholder": "Select the methodology",
  },
  other_methodology_description: {
    "ui:widget": "textarea",
  },
  emission_allocation_title: {
    "ui:FieldTemplate": TitleOnlyFieldTemplate,
    "ui:classNames": "mt-2 mb-5 emission-array-header",
  },
  facility_emission_data: {
    "ui:FieldTemplate": FieldTemplate,
    "ui:ArrayFieldTemplate": ArrayFieldTemplate,
    "ui:options": {
      addable: false,
      removable: false,
      label: false,
    },
    items: {
      emission_category: {
        "ui:FieldTemplate": FieldTemplate,
        "ui:widget": EmissionAllocationTitleWidget,
        "ui:classNames": "emission-array-header",
        "ui:options": {
          label: false,
        },
      },
      emission_total: {
        "ui:widget": ReadOnlyWidget,
      },
      products: {
        "ui:options": {
          label: false,
          addable: false,
          removable: false,
        },
        items: {
          product_name: {
            "ui:widget": ReadOnlyWidget,
            "ui:options": {
              label: false,
            },
          },
          product_emission: {
            "ui:options": {
              label: false,
            },
            type: "number",
          },
        },
      },
    },
  },
};
