import { RJSFSchema, UiSchema, FieldTemplateProps } from "@rjsf/utils";
import {
  FieldTemplate,
  TitleOnlyFieldTemplate,
} from "@bciers/components/form/fields";
import { attachmentNote } from "./verificationText";

/**
 * Shared schema properties for SFO and LFO schemas
 */
const sharedSchemaProperties: RJSFSchema["properties"] = {
  verification_body_name: {
    title: "Verification body name",
    type: "string",
  },
  accredited_by: {
    title: "Accredited by",
    type: "string",
    enum: ["ANAB", "SCC"],
  },
  scope_of_verification: {
    title: "Scope of verification",
    type: "string",
    enum: [
      "B.C. OBPS Annual Report",
      "Supplementary Report",
      "Corrected Report",
    ],
  },
  threats_to_independence: {
    title: "Were there any threats to independence noted",
    type: "boolean",
  },
  verification_conclusion: {
    title: "Verification conclusion",
    type: "string",
    enum: ["Positive", "Modified", "Negative"],
  },
  verification_note: {
    //Not an actual field in the db - this is just to make the form look like the wireframes
    type: "object",
    readOnly: true,
  },
};
/**
 * Shared required fields for SFO and LFO schemas
 */
const sharedRequiredFields = [
  "verification_body_name",
  "accredited_by",
  "scope_of_verification",
  "visit_names",
  "threats_to_independence",
  "verification_conclusion",
];
/**
 * Shared ui schema properties for SFO and LFO schemas
 */
const sharedUiSchema: UiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  verification_body_name: {
    "ui:placeholder": "Enter verification body name",
  },
  accredited_by: {
    "ui:placeholder": "Select accrediting body",
  },
  scope_of_verification: {
    "ui:placeholder": "Select scope of verification",
  },
  threats_to_independence: {
    "ui:widget": "RadioWidget",
  },
  verification_conclusion: {
    "ui:placeholder": "Select verification conclusion",
  },
  verification_note: {
    "ui:FieldTemplate": TitleOnlyFieldTemplate,
    "ui:title": attachmentNote,
  },
};
/**
 * Shared ui:order for SFO and LFO schemas
 */
const sharedUIOrder = [
  "verification_body_name",
  "accredited_by",
  "scope_of_verification",
  "visit_names",
  "visit_types",
  "visit_others",
  "threats_to_independence",
  "verification_conclusion",
  "verification_note",
];
/**
 * Function to fetch the associated visit_name for a visit_type based on the field ID and the form context.
 * @param {string} fieldId - ID of the field (e.g., "root_visit_types_0_visit_type")
 * @param {any} context - Context of the form, containing the visit_types array
 * @returns {string | null} - Returns the visit_name or null
 */
const getAssociatedVisitName = (
  fieldId: string,
  context: any,
): string | null => {
  try {
    // Match for visit_types ID pattern
    const visitTypesMatch = fieldId.match(/root_visit_types_(\d+)_visit_type/);
    if (visitTypesMatch) {
      const visitIndex = Number(visitTypesMatch[1]); // Extract index

      // Ensure context is valid and contains visit_types array
      if (Array.isArray(context?.visit_types)) {
        const visitTypeData = context.visit_types[visitIndex];

        // Return the associated visit_name
        return visitTypeData?.visit_name || null;
      }
    }

    // If no match or invalid context
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
const DynamicLabelVisitType: React.FC<FieldTemplateProps> = ({
  id,
  classNames,
  children,
  formContext,
}: FieldTemplateProps): JSX.Element => {
  const visitName = getAssociatedVisitName(id, formContext);
  return (
    <div className={`mb-4 md:mb-2 w-full ${classNames}`}>
      <div className="flex flex-col md:flex-row items-start md:items-center w-full">
        <div className="w-full md:w-3/12 mb-2 md:mb-0">
          <label htmlFor={id} className="font-bold">
            {visitName || "Visit Type"}
          </label>
        </div>
        <div className="w-full md:w-4/12">{children}</div>
      </div>
    </div>
  );
};

/**
 * SFO Verfication Form schema
 */
export const sfoSchema: RJSFSchema = {
  type: "object",
  title: "Verification",
  required: sharedRequiredFields,
  properties: {
    ...sharedSchemaProperties,
    visit_names: {
      title: "Sites visited",
      type: "string",
      enum: ["Facility X", "Other", "None"], // modified in components/verification/createVerificationSchema.ts
    },
  },
  dependencies: {
    visit_names: {
      oneOf: [
        {
          properties: {
            visit_names: {
              type: "string",
              minItems: 1,
              not: {
                enum: ["Other", "None"],
              },
            },
            visit_types: {
              type: "string",
              title: "Type of site visit",
              enum: ["Virtual", "In person"],
            },
          },
          required: ["visit_types"],
        },
        {
          properties: {
            visit_names: {
              enum: ["Other"],
            },
            visit_others: {
              title: "Other Visit(s)",
              type: "array",
              maxItems: 1,
              default: [
                {
                  visit_name: "",
                  visit_coordinates: "",
                  visit_type: "",
                },
              ],
              items: {
                type: "object",
                required: ["visit_name", "visit_coordinates", "visit_type"],
                properties: {
                  visit_name: {
                    title: "Name",
                    type: "string",
                  },
                  visit_coordinates: {
                    title: "Coordinates",
                    type: "string",
                  },
                  visit_type: {
                    title: "Visit Type",
                    type: "string",
                    enum: ["Virtual", "In person"],
                  },
                },
              },
            },
          },
          required: ["visit_others"],
        },
      ],
    },
  },
};

/**
 * SFO Verfication Form ui schema
 */
export const sfoUiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  "ui:order": sharedUIOrder,
  ...sharedUiSchema,
  visit_names: {
    "ui:placeholder": "Select site visited",
  },
  visit_types: {
    "ui:widget": "RadioWidget",
  },
  visit_others: {
    "ui:FieldTemplate": FieldTemplate,
    "ui:options": {
      addable: false,
      removable: false,
      label: false,
    },
    items: {
      visit_name: {
        "ui:placeholder": "Enter visit name",
      },
      visit_coordinates: {
        "ui:placeholder": "Enter coordinates",
      },
      visit_type: {
        "ui:widget": "RadioWidget",
      },
    },
  },
};

/**
 * LFO Verfication Form schema
 */
export const lfoSchema: RJSFSchema = {
  type: "object",
  title: "Verification",
  required: sharedRequiredFields,
  properties: {
    ...sharedSchemaProperties,
    visit_names: {
      type: "array",
      title: "Sites visited",
      items: {
        type: "string",
        enum: ["Facility X", "Other", "None"],
      },
      uniqueItems: true,
    },
    visit_types: {
      type: "array",
      items: {
        $ref: "#/definitions/visitTypeItem",
      },
    },
  },
  dependencies: {
    visit_names: {
      oneOf: [
        // Rule when "None" is selected
        {
          properties: {
            visit_names: {
              type: "array",
              items: {
                type: "string",
                enum: ["None"], // Only allow "None"
              },
              maxItems: 1,
              minItems: 1,
            },
          },
          required: ["visit_names"],
        },
        // Rule when "Other" is selected
        {
          properties: {
            visit_names: {
              type: "array",
              contains: { const: "Other" },
            },
            visit_others: {
              title: "Other Visit(s)",
              type: "array",
              minItems: 1,
              default: [
                {
                  visit_name: "",
                  visit_coordinates: "",
                  visit_type: "",
                },
              ],
              items: {
                type: "object",
                required: ["visit_name", "visit_coordinates", "visit_type"],
                properties: {
                  visit_name: {
                    title: "Name",
                    type: "string",
                  },
                  visit_coordinates: {
                    title: "Coordinates",
                    type: "string",
                  },
                  visit_type: {
                    title: "Visit Type",
                    type: "string",
                    enum: ["Virtual", "In person"],
                  },
                },
              },
            },
          },
          required: ["visit_others"],
        },
      ],
    },
  },
  definitions: {
    visitTypeItem: {
      type: "object",
      required: ["visit_type"],
      properties: {
        visit_name: {
          title: "Visit Name",
          type: "string",
          readOnly: true,
        },
        visit_type: {
          type: "string",
          enum: ["Virtual", "In person"],
        },
      },
    },
  },
};

/**
 * LFO Verfication Form ui schemas
 */
export const lfoUiSchema: UiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  "ui:order": sharedUIOrder,
  ...sharedUiSchema,
  visit_names: {
    "ui:widget": "MultiSelectWidget",
    "ui:placeholder": "Select site visited",
  },
  visit_types: {
    "ui:FieldTemplate": FieldTemplate,
    "ui:options": {
      addable: false,
      removable: false,
      label: false,
    },
    items: {
      "ui:order": ["visit_name", "visit_type"],
      visit_name: {
        "ui:widget": "hidden",
      },
      visit_type: {
        "ui:FieldTemplate": DynamicLabelVisitType,
        "ui:widget": "RadioWidget",
        "ui:options": {
          label: "Type of site visit",
        },
      },
    },
  },
  visit_others: {
    "ui:FieldTemplate": FieldTemplate,
    "ui:options": {
      arrayAddLabel: "Add Other Visit",
      addable: true, // Ensure users can add more visits manually
    },
    items: {
      visit_name: {
        "ui:placeholder": "Enter visit name",
      },
      visit_coordinates: {
        "ui:placeholder": "Enter coordinates",
      },
      visit_type: {
        "ui:widget": "RadioWidget",
      },
    },
  },
};
