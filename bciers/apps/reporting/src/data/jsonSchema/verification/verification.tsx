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
  visit_names: {
    type: "array",
    title: "Site(s) visited",
    uniqueItems: true,
    items: {
      type: "string",
      enum: ["Facility X", "Other", "None"], // modified in components/verification/createVerificationSchema.ts
    },
  },
  visit_types: {
    type: "array",
    items: {
      $ref: "#/definitions/visitTypeItem",
    },
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

// Shared schema definitions
export const visitTypeItemDefinition: RJSFSchema = {
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
  rawErrors = [],
}: FieldTemplateProps): JSX.Element => {
  const visitName = getAssociatedVisitName(id, formContext);

  return (
    <div className={`mb-4 md:mb-2 w-full ${classNames}`}>
      <div className="flex flex-col md:flex-row items-start md:items-center w-full">
        <div className="w-full md:w-3/12 mb-2 md:mb-0">
          <label htmlFor={id} className="font-bold">
            {visitName + "*" || "Visit Type"}
          </label>
        </div>

        <div className="relative flex items-center w-full lg:w-4/12">
          {children}
        </div>

        {/* Error display to the side */}
        {rawErrors.length > 0 && (
          <div
            className="w-full md:w-4/12 flex items-center text-red-600 ml-0 md:ml-4"
            role="alert"
          >
            <div className="hidden md:block mr-3">
              <svg
                width="26"
                height="26"
                viewBox="0 0 26 26"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M24.9933 20.6584C25.8033 22.0234 24.7865 23.7298 23.1687 23.7298H2.10886C0.487882 23.7298 -0.524194 22.0208 0.284256 20.6584L10.8143 2.90811C11.6247 1.54241 13.6545 1.54489 14.4635 2.90811L24.9933 20.6584ZM12.6389 16.9885C11.524 16.9885 10.6202 17.8672 10.6202 18.9512C10.6202 20.0351 11.524 20.9138 12.6389 20.9138C13.7538 20.9138 14.6576 20.0351 14.6576 18.9512C14.6576 17.8672 13.7538 16.9885 12.6389 16.9885ZM10.7223 9.93388L11.0478 15.7364C11.0631 16.008 11.294 16.2205 11.5737 16.2205H13.7041C13.9838 16.2205 14.2147 16.008 14.2299 15.7364L14.5555 9.93388C14.5719 9.64059 14.3318 9.39398 14.0297 9.39398H11.2481C10.946 9.39398 10.7058 9.64059 10.7223 9.93388Z"
                  fill="#D8292F"
                />
              </svg>
            </div>
            <span>Required field</span>
          </div>
        )}
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
              title: "Other Visit",
              type: "array",
              minItems: 1,
              maxItems: 1,
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
    visitTypeItem: visitTypeItemDefinition,
  },
};

/**
 * SFO Verfication Form ui schemas
 */
export const sfoUiSchema: UiSchema = {
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
        "ui:title": "Type of site visit",
        "ui:widget": "RadioWidget",
      },
    },
  },
  visit_others: {
    "ui:FieldTemplate": FieldTemplate,
    "ui:options": {
      addable: false,
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
        },
      ],
    },
  },
  definitions: {
    visitTypeItem: visitTypeItemDefinition,
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
      },
    },
  },
  visit_others: {
    "ui:FieldTemplate": FieldTemplate,
    "ui:options": {
      arrayAddLabel: "Add Other Visit",
      addable: true,
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
