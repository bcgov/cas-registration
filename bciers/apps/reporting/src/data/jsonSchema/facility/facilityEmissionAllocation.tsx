// Import necessary components, types, and utilities for rendering the form
import {
  ArrayFieldTemplate,
  FieldTemplate,
  TitleOnlyFieldTemplate,
} from "@bciers/components/form/fields";
import { ReadOnlyWidget } from "@bciers/components/form/widgets/readOnly";
import { RJSFSchema, UiSchema, WidgetProps } from "@rjsf/utils";

import { FieldTemplateProps } from "@rjsf/utils";

/**
 * Widget to display the title of an emission allocation category
 * @param {WidgetProps} props - Includes id and value for the widget
 */
const EmissionAllocationTitleWidget: React.FC<WidgetProps> = ({
  id,
  value,
}) => {
  const capitalizeEachWord = (str: string | undefined) =>
    str
      ? str
          .split("_")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")
      : "";
  switch (value) {
    case "woody_biomass":
      value = "CO2 emissions from excluded woody biomass:";
      break;
    case "excluded_biomass":
      value = "Other emissions from excluded biomass:";
      break;
    case "excluded_non_biomass":
      value = "Emissions from excluded non-biomass:";
      break;
    default:
      value = capitalizeEachWord(value);
      break;
  }
  return (
    <div id={id}>
      <u>{value}</u>
    </div>
  );
};

/**
 * Utility function to fetch the associated product name dynamically
 * based on the field ID and the form context.
 * @param {string} fieldId - ID of the field
 * @param {any} formContext - Context of the form, containing all data
 * @returns {string | null} - Returns the product name or null
 */
const getAssociatedProductName = (fieldId: string, formContext: any) => {
  try {
    // Extract facility and product indices from the field ID
    const match = fieldId.match(/_(\d+)_products_(\d+)_product_emission/);
    if (!match) {
      return null;
    }
    const [_, facilityIndex, productIndex] = match.map(Number);

    // Access the product name from the form context
    const facilityData = formContext.facility_emission_data?.[facilityIndex];
    const productData = facilityData?.products?.[productIndex];

    return productData?.product_name || null;
  } catch (error) {
    return null;
  }
};

/**
 * Custom Field Template for displaying a dynamic label and input field inline
 * @param {FieldTemplateProps} props - Props including id, classNames, children, and formContext
 * @returns {JSX.Element} - Rendered label and input field
 */
const DynamicLabelFieldTemplate: React.FC<FieldTemplateProps> = ({
  id,
  classNames,
  children,
  formContext,
}) => {
  const productName = getAssociatedProductName(id, formContext);
  return (
    <div className={`mb-4 md:mb-2 w-full ${classNames}`}>
      <div className="flex flex-col md:flex-row items-start md:items-center w-full">
        <div className="w-full md:w-3/12 mb-2 md:mb-0">
          <label htmlFor={id} className="font-bold">
            {productName}
          </label>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

/**
 * Schema Definition for Emission Allocation Form
 * This defines the structure of the form, including the fields, their types, and dependencies.
 */
export const emissionAllocationSchema: RJSFSchema = {
  type: "object",
  title: "Allocation of Emissions",
  properties: {
    methodology: {
      type: "string",
      title: "Methodology",
      enum: ["Calculator", "Other"],
    },
    fuel_excluded_emission_data_title: {
      title:
        "Allocate the facility's total emissions, by emissions excluded by fuel type:",
      type: "string",
    },
    basic_emission_data_title: {
      title:
        "Allocate the facility's total emissions by emission category, among its regulated products in tCO2e:",
      type: "string",
    },
    basic_emission_data: {
      type: "array",
      items: {
        $ref: "#/definitions/emissionCategoryAllocationItem",
      },
    },
    fuel_excluded_emission_data: {
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
          required: ["other_methodology_description"], // Required if 'Other' is selected
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
          type: "number",
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
        products_emission_sum: {
          title: "Total Allocated",
          type: "string",
          readOnly: true,
        },
      },
    },
  },
};

/**
 * UI Schema for Emission Allocation Form
 * Specifies custom field templates, widgets, and layout for the form.
 */
export const emissionAllocationUiSchema: UiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  "ui:order": [
    "methodology",
    "other_methodology_description",
    "basic_emission_data_title",
    "basic_emission_data",
    "fuel_excluded_emission_data_title",
    "fuel_excluded_emission_data",
  ],
  methodology: {
    "ui:widget": "SelectWidget",
    "ui:placeholder": "Select the methodology",
  },
  other_methodology_description: {
    "ui:widget": "textarea",
  },
  basic_emission_data_title: {
    "ui:FieldTemplate": TitleOnlyFieldTemplate,
    "ui:classNames": "mt-1 mb-1 emission-array-header",
  },
  basic_emission_data: {
    "ui:classNames": "mt-0 mb-2 p-0",
    "ui:ArrayFieldTemplate": ArrayFieldTemplate,
    "ui:FieldTemplate": FieldTemplate,
    "ui:options": {
      addable: false,
      removable: false,
      label: false,
    },
    items: {
      emission_category: {
        "ui:FieldTemplate": FieldTemplate,
        "ui:widget": EmissionAllocationTitleWidget,
        "ui:classNames": "emission-array-header w-full",
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
        "ui:FieldTemplate": FieldTemplate,
        items: {
          product_name: {
            "ui:widget": "hidden",
          },
          product_emission: {
            "ui:FieldTemplate": DynamicLabelFieldTemplate,
          },
        },
      },
      products_emission_sum: {
        "ui:widget": ReadOnlyWidget,
      },
    },
  },
  fuel_excluded_emission_data_title: {
    "ui:FieldTemplate": TitleOnlyFieldTemplate,
    "ui:classNames": "mt-2 mb-5 emission-array-header",
  },

  fuel_excluded_emission_data: {
    "ui:ArrayFieldTemplate": ArrayFieldTemplate,
    "ui:FieldTemplate": FieldTemplate,
    "ui:options": {
      addable: false,
      removable: false,
      label: false,
    },
    items: {
      emission_category: {
        "ui:FieldTemplate": FieldTemplate,
        "ui:widget": EmissionAllocationTitleWidget,
        "ui:classNames": "emission-array-header w-full",
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
        "ui:FieldTemplate": FieldTemplate,
        items: {
          product_name: {
            "ui:widget": "hidden",
          },
          product_emission: {
            "ui:FieldTemplate": DynamicLabelFieldTemplate,
          },
        },
      },
      products_emission_sum: {
        "ui:widget": ReadOnlyWidget,
      },
    },
  },
};
