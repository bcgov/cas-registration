import { RJSFSchema, UiSchema, WidgetProps } from "@rjsf/utils";

import { Typography } from "@mui/material";
import {
  ArrayFieldTemplate,
  FieldTemplate,
  TitleOnlyFieldTemplate,
} from "@bciers/components/form/fields";
import checkboxWidget from "@bciers/components/form/widgets/CheckboxWidget";
import { DateWidget } from "@bciers/components/form/widgets";
import { ReadOnlyWidget } from "@bciers/components/form/widgets/readOnly";
import React from "react";
import ObjectFieldTemplate from "@rjsf/core/lib/components/templates/ObjectFieldTemplate";

interface FieldTemplateProps {
  id: string;
  classNames: string;
  children: React.ReactNode;
  formContext: any; // Adjust `any` to a specific type if possible for better type safety
}
export const ProductionDataTitleWidget: React.FC<WidgetProps> = ({
  id,
  value,
}) => {
  return (
    <div id={id} className="w-full mt-8">
      <h2 className="inline-block p-0 text-lg font-bold text-bc-bg-blue m-0 mb-12">
        <u>Product:</u> {value}
      </h2>
    </div>
  );
};
/**
 * Utility function to fetch the associated emission name dynamically
 * based on the field ID and the form context.
 * @param {string} fieldId - ID of the field
 * @param {any} formContext - Context of the form, containing all data
 * @returns {string | null} - Returns the emission name or null
 */
const getAssociatedEmissionName = (
  fieldId: string,
  formContext: any,
): string | null => {
  try {
    const match = fieldId.match(/root_emissions_(\d+)_items_(\d+)_emission/);
    if (!match) {
      return null;
    }

    const emissionCategoryIndex = Number(match[1]);
    const itemIndex = Number(match[2]);

    const emissionCategory = formContext.emissions?.[emissionCategoryIndex];

    if (!emissionCategory) {
      return null;
    }
    const emissionItem = emissionCategory.items?.[itemIndex];
    return emissionItem?.name || null;
  } catch (error) {
    return null;
  }
};

/**
 * Custom Field Template for displaying a dynamic label for emissions
 * @param {FieldTemplateProps} props - Props including id, classNames, children, and formContext
 * @returns {JSX.Element} - Rendered label and input field
 */
const DynamicEmissionLabelFieldTemplate: React.FC<FieldTemplateProps> = ({
  id,
  classNames,
  children,
  formContext,
}: FieldTemplateProps): JSX.Element => {
  const emissionName = getAssociatedEmissionName(id, formContext);
  return (
    <div className={`mb-4 md:mb-2 w-full ${classNames}`}>
      <div className="flex flex-col md:flex-row items-start md:items-center w-full">
        <div className="w-full md:w-3/12 mb-2 md:mb-0">
          <label htmlFor={id} className="font-bold">
            {emissionName}
          </label>
        </div>
        <div className="w-full md:w-4/12">{children}</div>
      </div>
    </div>
  );
};

export const EmissionDataTitleWidget: React.FC<WidgetProps> = ({
  id,
  value,
}) => {
  return (
    <div id={id} className="w-full mt-8">
      <h2 className="inline-block p-0 text-lg font-bold text-bc-bg-blue m-0 mb-12">
        {value}
      </h2>
    </div>
  );
};

export const newEntrantInfo = (
  <Typography variant="body2" color="primary" fontStyle="italic" fontSize={16}>
    This section applies to operations that fall under{" "}
    <u>new entrant category</u>.
  </Typography>
);

export const NewEntrantUiSchema: UiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  purpose_note: {
    "ui:FieldTemplate": TitleOnlyFieldTemplate,
    "ui:title": newEntrantInfo,
  },
  id: {
    "ui:widget": "hidden",
  },
  assertion_statement: {
    "ui:widget": checkboxWidget,
    "ui:options": {
      label:
        "I certify that this operation was a reporting operation on the date that the application for designation as a new entrant was submitted to the Director under GGIRCA.",
    },
  },
  authorization_date: {
    "ui:widget": DateWidget,
  },
  first_shipment_date: {
    "ui:widget": DateWidget,
  },
  new_entrant_period_start: {
    "ui:widget": DateWidget,
  },
  products: {
    "ui:FieldTemplate": FieldTemplate,
    "ui:ArrayFieldTemplate": ArrayFieldTemplate,
    "ui:options": {
      addable: false,
      removable: false,
      label: false,
    },
    items: {
      id: {
        "ui:widget": "hidden",
      },
      name: {
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
  emissions: {
    "ui:FieldTemplate": FieldTemplate,
    "ui:ArrayFieldTemplate": ArrayFieldTemplate,
    "ui:options": {
      addable: false,
      removable: false,
      label: false,
    },
    items: {
      "ui:ObjectFieldTemplate": ObjectFieldTemplate,
      "ui:options": {
        addable: false,
        removable: false,
        label: false,
      },
      title: {
        "ui:FieldTemplate": FieldTemplate,
        "ui:widget": EmissionDataTitleWidget,
        "ui:options": {
          label: false,
        },
      },
      items: {
        "ui:FieldTemplate": FieldTemplate,
        "ui:ArrayFieldTemplate": ArrayFieldTemplate,
        "ui:options": {
          addable: false,
          removable: false,
          label: false,
        },
        items: {
          id: {
            "ui:widget": "hidden",
          },
          name: {
            "ui:widget": "hidden",
          },
          emission: {
            "ui:FieldTemplate": DynamicEmissionLabelFieldTemplate,
          },
        },
      },
    },
  },
};

export const NewEntrantSchema: RJSFSchema = {
  type: "object",
  title: "New Entrant Information",
  properties: {
    purpose_note: {
      type: "object",
      readOnly: true,
    },
    id: {
      type: "integer",
      title: "New entrant Id",
    },
    authorization_date: {
      type: "string",
      title: "Date of authorization",
    },
    first_shipment_date: {
      type: "string",
      title: "Date of first shipment",
    },
    new_entrant_period_start: {
      type: "string",
      title: "Date new entrant period began",
    },
    assertion_statement: {
      type: "boolean",
      title: "Assertion statement",
      default: false,
    },
    products: {
      type: "array",
      items: {
        $ref: "#/definitions/newEntrantProduction",
      },
    },
    emissions: {
      type: "array",
      items: {
        $ref: "#/definitions/emissionData",
      },
    },
  },
  definitions: {
    newEntrantProduction: {
      properties: {
        id: {
          type: "integer",
          title: "Product ID",
        },
        name: {
          type: "string",
          title: "Product Name",
        },
        unit: {
          type: "string",
          title: "Unit",
        },
        production_amount: {
          type: "number",
          title: "Production after new entrant period began",
        },
      },
    },
    emissionData: {
      properties: {
        title: {
          type: "string",
        },
        items: {
          type: "array",
          items: {
            properties: {
              id: {
                type: "number",
              },
              name: {
                type: "string",
              },
              emission: {
                type: "number",
              },
            },
          },
        },
      },
    },
  },
};
