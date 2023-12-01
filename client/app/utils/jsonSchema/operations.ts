import FieldTemplate from "@/app/styles/rjsf/FieldTemplate";
import { RJSFSchema } from "@rjsf/utils";
import provinceOptions from "@/app/data/provinces.json";

const operationPage1: RJSFSchema = {
  type: "object",
  title: "Operation General Information",
  required: [
    "name",
    "type",
    "naics_code_id",
    // keys that are questions aren't saved in the database
  ],
  properties: {
    verified_by: { type: "string" },
    verified_at: { type: "string" },
    name: { type: "string", title: "Operation Name" },
    type: {
      type: "string",
      title: "Operation Type",
      enum: ["Single Facility Operation", "Linear Facilities Operation"],
    },
    naics_code_id: {
      type: "number",
      title: "Primary NAICS Code",
    },
    regulated_products: {
      type: "array",
      items: {
        type: "number",
      },
      title: "Regulated Product Name(s)",
    },
    reporting_activities: {
      type: "array",
      items: {
        type: "number",
      },
      title: "Reporting Activities",
    },
    process_flow_diagram: {
      type: "string",
      title: "Process Flow Diagram",
      format: "data-url",
    },
    boundary_map: {
      type: "string",
      title: "Boundary Map",
      format: "data-url",
    },

    "Did you submit a GHG emissions report for reporting year 2022?": {
      type: "boolean",
      default: false,
    },

    // documents: { type: "string", title: "documents" },
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
  ],
};

const operationPage2: RJSFSchema = {
  type: "object",
  title: "Multiple Operators Information",
  properties: {
    "Does the operation have multiple operators?": {
      type: "boolean",
      default: false,
    },
  },
  allOf: [
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
  ],
};

const operationPage3: RJSFSchema = {
  type: "object",
  title: "Application Lead",
  properties: {
    is_application_lead_external: {
      type: "boolean",
      title: "Would you like to add an exemption ID application lead?",
      default: false,
    },
  },
  allOf: [
    {
      if: {
        properties: {
          is_application_lead_external: {
            const: true,
          },
        },
      },
      then: {
        type: "object",
        required: [
          "first_name",
          "last_name",
          "position_title",
          "street_address",
          "municipality",
          "province",
          "postal_code",
          "email",
          "phone_number",
        ],
        properties: {
          first_name: {
            type: "string",
            title: "First Name",
          },
          last_name: {
            type: "string",
            title: "Last Name",
          },
          position_title: {
            type: "string",
            title: "Position Title",
          },
          street_address: {
            type: "string",
            title: "Mailing Address",
          },
          municipality: {
            type: "string",
            title: "Municipality",
          },
          province: {
            type: "string",
            title: "Province",
            anyOf: provinceOptions,
          },
          postal_code: {
            type: "string",
            title: "Postal Code",
          },
          email: {
            type: "string",
            title: "Email Address",
            format: "email",
          },
          phone_number: {
            type: "string",
            title: "Phone Number",
          },
        },
      },
    },
  ],
};

export const operationSchema: RJSFSchema = {
  type: "object",
  title: "Operation",
  properties: {
    operationPage1,
    operationPage2,
    operationPage3,
  },
};

export const operationUiSchema = {
  "ui:order": [
    "operationPage1",
    "operationPage2",
    "operationPage3",
    "name",
    "type",
    "naics_code_id",
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
    "is_application_lead_external",
    "first_name",
    "last_name",
    "position_title",
    "street_address",
    "municipality",
    "province",
    "postal_code",
    "email",
    "phone_number",
    "verified_by",
    "verified_at",
  ],
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  "ui:options": { label: false },
  id: {
    "ui:widget": "hidden",
  },
  type: {
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
    "ui:widget": "SelectWidget",
    "ui:placeholder": "Select Primary NAICS code",
  },
  "Did you submit a GHG emissions report for reporting year 2022?": {
    "ui:widget": "RadioWidget",
  },
  "Does the operation have multiple operators?": {
    "ui:widget": "RadioWidget",
  },
  is_application_lead_external: {
    "ui:widget": "RadioWidget",
  },
  opt_in: {
    "ui:widget": "RadioWidget",
  },
  data_flow_diagram: {
    "ui:widget": "FileWidget",
  },
  boundary_map: {
    "ui:widget": "FileWidget",
  },
  province: {
    "ui:widget": "ComboBox",
  },
};
