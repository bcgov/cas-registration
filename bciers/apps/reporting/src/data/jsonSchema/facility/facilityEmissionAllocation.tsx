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
      enum: ["Calculator", "Other"], // Dropdown options for methodology selection
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
          title: "Name", // Name of the emission category
          type: "string",
        },
        emission_total: {
          title: "Total Emissions",
          type: "string",
          readOnly: true, // Read-only field
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
          title: "Sum of Product Emissions",
          type: "number",
          readOnly: true,
        },
      },
    },
  },
};

/**
 * Widget to display the title of an emission allocation category
 * @param {WidgetProps} props - Includes id and value for the widget
 */
const EmissionAllocationTitleWidget: React.FC<WidgetProps> = ({
  id,
  value,
}) => {
  return (
    <div id={id} className="w-full mt-8">
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
    const match = fieldId.match(
      /root_facility_emission_data_(\d+)_products_(\d+)_product_emission/,
    );
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
  style,
  children,
  formContext,
}) => {
  const productName = getAssociatedProductName(id, formContext);

  return (
    <div
      className={`flex flex-col md:flex-row items-start md:items-center ${classNames}`}
      style={{ marginBottom: "1rem", ...style }} // Matches spacing with other fields
    >
      {/* Label Section */}
      <div className="w-full lg:w-3/12">
        <label
          htmlFor={id}
          className="font-bold"
          style={{ flexShrink: 0 }}
          data-testid="dynamic-label"
        >
          {productName}
        </label>
      </div>

      {/* Field Section */}
      <div className="relative flex items-center w-full lg:w-4/12">
        {children}
      </div>
    </div>
  );
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
            "ui:widget": "hidden",
          },
          product_emission: {
            "ui:FieldTemplate": DynamicLabelFieldTemplate,
            type: "number",
          },
        },
      },
      products_emission_total: {
        "ui:widget": ReadOnlyWidget,
      },
    },
  },
};
