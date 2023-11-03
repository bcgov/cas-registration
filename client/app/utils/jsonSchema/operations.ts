import FieldTemplate from "@/app/styles/rjsf/FieldTemplate";
import GroupedObjectFieldTemplateWrapper from "@/app/styles/rjsf/GroupedObjectFieldTemplateWrapper";
import { RJSFSchema } from "@rjsf/utils";

export const operationSchema: RJSFSchema = {
  type: "object",
  required: [
    "name",
    "type",
    "naics_code_id",
    "naics_category_id",
    // keys that are questions aren't saved in the database
    "Did you submit a GHG emissions report for reporting year 2022?",
  ],
  title: "Operation",
  properties: {
    verified_by: { type: "string" },
    verified_at: { type: "string" },
    name: { type: "string", title: "Operation Name" },
    operation_type: {
      type: "string",
      title: "Operation Type",
      enum: ["Single Facility Operation", "Linear Facilities Operation"],
    },
    naics_code_id: { type: "number", title: "Primary NAICS Code" },
    naics_category_id: { type: "number", title: "NAICS Category" },
    regulated_products: {
      type: "string",
      title: "Regulated Product Name(s)",
      readOnly: true,
    },
    reporting_activities: {
      type: "string",
      title: "Reporting Activities",
      readOnly: true,
    },
    process_flow_diagram: {
      type: "string",
      title: "Process Flow Diagram",
      format: "data-url",
      readOnly: true,
    },
    boundary_map: {
      type: "string",
      title: "Boundary Map",
      format: "data-url",
      readOnly: true,
    },

    "Did you submit a GHG emissions report for reporting year 2022?": {
      type: "boolean",
      default: false,
    },
    "Does the operation have multiple operators?": {
      type: "boolean",
      default: false,
    },
    "Would you like to add an exemption ID application lead?": {
      type: "boolean",
      default: false,
    },
    // temp handling of many to many, will be addressed in #138
    // petrinex_ids: { type: "number", title: "Petrinex IDs" },

    // documents: { type: "string", title: "documents" },
    // contacts: { type: "string", title: "contacts" },
  },
  allOf: [
    {
      if: {
        properties: {
          "Did you submit a GHG emissions report for reporting year 2022?": {
            const: true,
          },
        },
      },
      then: {
        properties: {
          previous_year_attributable_emissions: {
            type: "number",
            title: "2022 attributable emissions",
          },
          swrs_facility_id: { type: "number", title: "SWRS Facility ID" },
          bcghg_id: { type: "number", title: "BCGHG ID" },
        },
        required: [
          "previous_year_attributable_emissions",
          "swrs_facility_id",
          "bcghg_id",
        ],
      },
    },
    {
      if: {
        properties: {
          "Did you submit a GHG emissions report for reporting year 2022?": {
            const: false,
          },
        },
      },

      then: {
        properties: {
          opt_in: {
            type: "boolean",
            title: "Is the operation an opt-in operation?",
            default: false,
          },
        },
        allOf: [
          {
            if: {
              properties: {
                opt_in: {
                  const: true,
                },
              },
            },
            then: {
              properties: {
                opt_in_signed_statuatory_declaration: {
                  type: "string",
                  title: "Opt-in Signed Statuatory Declaration",
                  format: "data-url",
                  readOnly: true,
                },
              },
            },
          },
        ],
        required: ["opt_in"],
      },
    },
    {
      if: {
        properties: {
          "Does the operation have multiple operators?": {
            const: true,
          },
        },
      },
      then: {
        properties: {
          operators: {
            type: "string",
            title: "To be added in #136",
          },
          percentage_ownership: {
            type: "number",
            title: "Percentage of ownership of operation",
          },
        },
      },
    },
    {
      if: {
        properties: {
          "Would you like to add an exemption ID application lead?": {
            const: true,
          },
        },
      },
      then: {
        properties: {
          application_lead: {
            type: "string",
            title: "To be added in #136",
          },
        },
      },
    },
  ],
};

export const operationUiSchema = {
  "ui:order": [
    "name",
    "operation_type",
    "naics_code_id",
    "naics_category_id",
    "regulated_products",
    "reporting_activities",
    "process_flow_diagram",
    "boundary_map",
    "Did you submit a GHG emissions report for reporting year 2022?",
    "previous_year_attributable_emissions",
    "swrs_facility_id",
    "bcghg_id",
    "current_year_estimated_emissions",
    "opt_in",
    "opt_in_signed_statuatory_declaration",
    "Does the operation have multiple operators?",
    "operators",
    "percentage_ownership",
    "Would you like to add an exemption ID application lead?",
    "application_lead",
    "verified_by",
    "verified_at",
  ],
  "ui:ObjectFieldTemplate": GroupedObjectFieldTemplateWrapper,
  "ui:FieldTemplate": FieldTemplate,

  id: {
    "ui:widget": "hidden",
  },
  operation_type: {
    "ui:widget": "SelectWidget",
    "ui:placeholder": "Select operation type",
  },
  verified_by: {
    "ui:widget": "hidden",
  },
  verified_at: {
    "ui:widget": "hidden",
  },
  naics_code_id: {
    "ui:widget": "select",
  },
  "Did you submit a GHG emissions report for reporting year 2022?": {
    "ui:widget": "radio",
  },
  "Does the operation have multiple operators?": {
    "ui:widget": "radio",
  },
  "Would you like to add an exemption ID application lead?": {
    "ui:widget": "radio",
  },
  opt_in: {
    "ui:widget": "radio",
  },
};

export const operationsGroupSchema = [
  {
    title: "Step 1: Operation General Information",
    fields: [
      "name",
      "operation_type",
      "naics_code_id",
      "naics_category_id",
      "regulated_products",
      "reporting_activities",
      "process_flow_diagram",
      "boundary_map",
      "Did you submit a GHG emissions report for reporting year 2022?",
      "previous_year_attributable_emissions",
      "swrs_facility_id",
      "bcghg_id",
      "current_year_estimated_emissions",
      "opt_in",
      "opt_in_signed_statuatory_declaration",
    ],
  },
  {
    title:
      "Step 2: Operation Operator Information - If operation has multiple operators",
    fields: [
      "Does the operation have multiple operators?",
      "operators",
      "percentage_ownership",
    ],
  },
  {
    title: "Step 3: Operation Representative (OR) Information",
    fields: [
      'Is the operation representative the same as mentioned in "admin access request"?',
      "Is the senior officer the same as in the operation form?",
      "so",
      "Would you like to add an exemption ID application lead?",
      "application_lead",
    ],
  },
];
