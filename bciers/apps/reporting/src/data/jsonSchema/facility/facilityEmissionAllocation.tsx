import {
  ArrayFieldTemplate,
  FieldTemplate,
  TitleOnlyFieldTemplate,
} from "@bciers/components/form/fields";
import { ReadOnlyWidget } from "@bciers/components/form/widgets/readOnly";
import TextAreaWidget from "@bciers/components/form/widgets/TextAreaWidget";
import {
  RJSFSchema,
  UiSchema,
  WidgetProps,
  FieldTemplateProps,
} from "@rjsf/utils";

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
 * Function to fetch a fields associated product name within the form context
 * based on the field ID and the form context.
 * @param {string} fieldId - ID of the field
 * @param {any} context - Context of the form, containing the field data
 * @returns {string | null} - Returns the product name or null
 */
const getAssociatedProductName = (
  fieldId: string,
  context: any,
): string | null => {
  try {
    // Match for array-based context
    const arrayContextMatch = fieldId.match(
      /_(\d+)_products_(\d+)_allocated_quantity/,
    );
    if (arrayContextMatch) {
      const [, contextIndex, productIndex] = arrayContextMatch.map(Number);

      // Ensure valid indices and data structure
      const contextData = context[contextIndex];
      if (contextData?.products) {
        const productData = contextData.products[productIndex];
        return productData?.product_name || null;
      }
      return null;
    }

    // Match for object-based context
    const objectContextMatch = fieldId.match(
      /root_(\w+)_products_(\d+)_allocated_quantity/,
    );
    if (objectContextMatch) {
      const [, contextKey, productIndex] = objectContextMatch;

      // Handle array-based object context
      if (Array.isArray(context)) {
        const matchedCategory = context.find(
          (item: any) =>
            item.emission_category_name?.toLowerCase().replace(/\s+/g, "_") ===
            contextKey,
        );
        const productData = matchedCategory?.products?.[Number(productIndex)];
        return productData?.product_name || null;
      }

      // Handle single object context
      const productData = context.products?.[Number(productIndex)];
      return productData?.product_name || null;
    }

    // If no match found
    return null;
  } catch (error) {
    return null;
  }
};

/**
 * Custom Field Template for displaying a dynamic label and input field inline
 * @param {FieldTemplateProps} props - Props including id, classNames, children, and formContext
 * @returns {JSX.Element} - Rendered label and input field
 */
const DynamicLabelProductAllocation: React.FC<FieldTemplateProps> = ({
  id,
  classNames,
  children,
  formContext,
}) => {
  const productName = getAssociatedProductName(
    id,
    formContext.facility_emission_data,
  );
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
const DynamicLabelTotalProductAllocation: React.FC<FieldTemplateProps> = ({
  id,
  classNames,
  children,
  formContext,
}) => {
  const productName = getAssociatedProductName(
    id,
    formContext.total_emission_allocations,
  );
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
  required: ["allocation_methodology"],
  properties: {
    allocation_methodology: {
      type: "string",
      title: "Methodology",
      enum: ["Not Applicable", "OBPS Allocation Calculator", "Other"],
    },
    basic_emission_allocation_data_title: {
      title:
        "Allocate the facility's total emissions, by emission category, among its regulated products in tCO2e:",
      type: "string",
    },
    basic_emission_allocation_data: {
      type: "array",
      items: {
        $ref: "#/definitions/emissionCategoryAllocationItem",
      },
    },
    fuel_excluded_emission_allocation_data_title: {
      title:
        "Allocate the facility's total emissions, by emissions excluded by fuel type:",
      type: "string",
    },
    fuel_excluded_emission_allocation_data: {
      type: "array",
      items: {
        $ref: "#/definitions/emissionCategoryAllocationItem",
      },
    },
    total_emission_allocations: {
      type: "object",
      title: "Totals in tCO2e",
      properties: {
        facility_total_emissions: {
          type: "string",
          title: "Total emissions attributable for reporting",
        },
        products: {
          type: "array",
          items: {
            type: "object",
            properties: {
              report_product_id: {
                type: "number",
                minimum: 0,
              },
              product_name: {
                type: "string",
              },
              allocated_quantity: {
                type: "string",
              },
            },
          },
        },
      },
    },
  },
  dependencies: {
    allocation_methodology: {
      oneOf: [
        {
          properties: {
            allocation_methodology: {
              enum: ["Other"],
            },
            allocation_other_methodology_description: {
              type: "string",
              title: "Details about the allocation methodology",
            },
          },
          required: ["allocation_other_methodology_description"], // Required if 'Other' is selected
        },
        {
          properties: {
            allocation_methodology: {
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
        emission_category_name: {
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
              report_product_id: {
                type: "number",
                minimum: 0,
              },
              product_name: {
                type: "string",
              },
              allocated_quantity: {
                type: "string",
              },
            },
          },
        },
        products_emission_allocation_sum: {
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
    "allocation_methodology",
    "allocation_other_methodology_description",
    "basic_emission_allocation_data_title",
    "basic_emission_allocation_data",
    "fuel_excluded_emission_allocation_data_title",
    "fuel_excluded_emission_allocation_data",
    "total_emission_allocations",
  ],
  allocation_methodology: {
    "ui:widget": "SelectWidget",
    "ui:placeholder": "Select the allocation methodology",
  },
  allocation_other_methodology_description: {
    "ui:widget": TextAreaWidget,
    "ui:placeholder": "Methodology Description",
  },
  basic_emission_allocation_data_title: {
    "ui:FieldTemplate": TitleOnlyFieldTemplate,
    "ui:classNames": "mt-1 mb-1 emission-array-header",
  },
  basic_emission_allocation_data: {
    "ui:classNames": "mt-0 mb-2 p-0",
    "ui:ArrayFieldTemplate": ArrayFieldTemplate,
    "ui:FieldTemplate": FieldTemplate,
    "ui:options": {
      addable: false,
      removable: false,
      label: false,
    },
    items: {
      emission_category_name: {
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
          report_product_id: {
            "ui:widget": "hidden",
          },
          product_name: {
            "ui:widget": "hidden",
          },
          allocated_quantity: {
            "ui:FieldTemplate": DynamicLabelProductAllocation,
          },
        },
      },
      products_emission_allocation_sum: {
        "ui:widget": ReadOnlyWidget,
      },
    },
  },
  fuel_excluded_emission_allocation_data_title: {
    "ui:FieldTemplate": TitleOnlyFieldTemplate,
    "ui:classNames": "mt-2 mb-5 emission-array-header",
  },
  fuel_excluded_emission_allocation_data: {
    "ui:ArrayFieldTemplate": ArrayFieldTemplate,
    "ui:FieldTemplate": FieldTemplate,
    "ui:options": {
      addable: false,
      removable: false,
      label: false,
    },
    items: {
      emission_category_name: {
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
          report_product_id: {
            "ui:widget": "hidden",
          },
          product_name: {
            "ui:widget": "hidden",
          },
          allocated_quantity: {
            "ui:FieldTemplate": DynamicLabelProductAllocation,
          },
        },
      },
      products_emission_allocation_sum: {
        "ui:widget": ReadOnlyWidget,
      },
    },
  },
  total_emission_allocations: {
    "ui:FieldTemplate": FieldTemplate,
    "ui:classNames": "section-heading-label",
    "ui:disabled": true,

    facility_total_emissions: {
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
        report_product_id: {
          "ui:widget": "hidden",
        },
        product_name: {
          "ui:widget": "hidden",
        },
        allocated_quantity: {
          "ui:FieldTemplate": DynamicLabelTotalProductAllocation,
        },
      },
    },
  },
};
