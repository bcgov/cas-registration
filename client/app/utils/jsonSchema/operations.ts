import FieldTemplate from "@/app/styles/rjsf/FieldTemplate";
import { RJSFSchema } from "@rjsf/utils";
import provinceOptions from "@/app/data/provinces.json";
import TitleOnlyFieldTemplate from "@/app/styles/rjsf/TitleOnlyFieldTemplate";
import {
  OperatorMailingAddressTitle,
  OperatorPhysicalAddressTitle,
} from "@/app/components/form/titles/userOperatorTitles";

const subheading = {
  "ui:classNames": "text-bc-bg-blue text-start text-lg",
  "ui:FieldTemplate": TitleOnlyFieldTemplate,
};

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
    multiple_operators_section: {
      //Not an actual field in the db - this is just to make the form look like the wireframes
      title: "Multiple operators information",
      type: "object",
      readOnly: true,
    },
    operation_has_multiple_operators: {
      type: "boolean",
      title: "Does the operation have multiple operators?",
      default: false,
    },
    // temp handling of many to many, will be addressed in #138
    // petrinex_ids: { type: "number", title: "Petrinex IDs" },

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
    {
      if: {
        properties: {
          operation_has_multiple_operators: {
            const: true,
          },
        },
      },
      then: {
        properties: {
          multiple_operators_array: {
            type: "array",
            default: [{}],
            items: {
              type: "object",
              required: [
                "mo_legal_name",
                "mo_trade_name",
                "mo_cra_business_number",
                "mo_bc_corporate_registry_number",
                /* "mo_business_structure", */
                "mo_percentage_ownership",
                "mo_physical_street_address",
                "mo_physical_municipality",
                "mo_physical_province",
                "mo_physical_postal_code",
              ],
              properties: {
                mo_legal_name: {
                  type: "string",
                  title: "Legal Name",
                },
                mo_trade_name: {
                  type: "string",
                  title: "Trade Name",
                },
                mo_cra_business_number: {
                  type: "number",
                  title: "CRA Business Number",
                },
                mo_bc_corporate_registry_number: {
                  type: "number",
                  title: "BC Corporate Registries Number",
                },
                mo_business_structure: {
                  type: "string",
                  title: "Business Structure",
                },
                mo_website: {
                  type: "string",
                  title: "Website (optional)",
                },
                mo_percentage_ownership: {
                  type: "number",
                  title: "Percentage of ownership of operation (%)",
                },
                mo_proof_of_authority: {
                  type: "string",
                  title:
                    "Proof of authority of designated operator from partner company",
                  format: "data-url",
                },
                mo_physical_address_section: {
                  //Not an actual field in the db - this is just to make the form look like the wireframes
                  title:
                    "Please provide information about the physical address of this operator:",
                  type: "object",
                  readOnly: true,
                },
                mo_physical_street_address: {
                  type: "string",
                  title: "Physical Address",
                },
                mo_physical_municipality: {
                  type: "string",
                  title: "Municipality",
                },
                mo_physical_province: {
                  type: "string",
                  title: "Province",
                  anyOf: provinceOptions,
                },
                mo_physical_postal_code: {
                  type: "string",
                  title: "Postal Code",
                },
                mo_mailing_address_section: {
                  //Not an actual field in the db - this is just to make the form look like the wireframes
                  title:
                    "Please provide information about the mailing address of this operator:",
                  type: "object",
                  readOnly: true,
                },
                mo_mailing_address_same_as_physical: {
                  title:
                    "Is the mailing address the same as the physical address?",
                  type: "boolean",
                  default: true,
                },
              },
              allOf: [
                {
                  if: {
                    properties: {
                      mo_mailing_address_same_as_physical: {
                        const: false,
                      },
                    },
                  },
                  then: {
                    required: [
                      "mo_mailing_street_address",
                      "mo_mailing_municipality",
                      "mo_mailing_province",
                      "mo_mailing_postal_code",
                    ],
                    properties: {
                      mo_mailing_street_address: {
                        type: "string",
                        title: "Mailing Address",
                      },
                      mo_mailing_municipality: {
                        type: "string",
                        title: "Municipality",
                      },
                      mo_mailing_province: {
                        type: "string",
                        title: "Province",
                        anyOf: provinceOptions,
                      },
                      mo_mailing_postal_code: {
                        type: "string",
                        title: "Postal Code",
                      },
                    },
                  },
                },
              ],
            },
          },
        },
      },
    },
  ],
};

const operationPage2: RJSFSchema = {
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
            format: "postal-code",
          },
          email: {
            type: "string",
            title: "Email Address",
          },
          phone_number: {
            type: "string",
            title: "Phone Number",
            format: "phone",
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
    "multiple_operators_section",
    "operation_has_multiple_operators",
    "multiple_operators_array",
    "mo_percentage_ownership",
    "mo_mailing_address_same_as_physical",
    "mo_mailing_address_section",
    "mo_mailing_street_address",
    "mo_mailing_municipality",
    "mo_mailing_province",
    "mo_mailing_postal_code",
    "Would you like to add an exemption ID application lead?",
    "application_lead",
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
    "ui:widget": "ComboBox",
    "ui:placeholder": "Select Primary NAICS code",
  },
  "Did you submit a GHG emissions report for reporting year 2022?": {
    "ui:widget": "RadioWidget",
  },
  operation_has_multiple_operators: {
    "ui:FieldTemplate": FieldTemplate,
    "ui:widget": "RadioWidget",
  },
  is_application_lead_external: {
  "Would you like to add an exemption ID application lead?": {
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
  multiple_operators_section: {
    ...subheading,
  },
  operation_has_multiple_operators: {
    "ui:widget": "RadioWidget",
  },

  multiple_operators_array: {
    "ui:FieldTemplate": FieldTemplate,
    "ui:options": {
      label: false,
    },
    items: {
      mo_physical_address_section: {
        ...subheading,
        "ui:options": {
          jsxTitle: OperatorPhysicalAddressTitle,
        },
      },
      mo_percentage_ownership: {
        "ui:options": {
          max: 100,
        },
      },
      mo_mailing_address_same_as_physical: {
        "ui:widget": "RadioWidget",
      },
      mo_business_structure: {
        "ui:widget": "ComboBox",
      },
      mo_physical_province: {
        "ui:widget": "ComboBox",
      },
      mo_mailing_province: {
        "ui:widget": "ComboBox",
      },
      mo_mailing_address_section: {
        ...subheading,
        "ui:options": {
          jsxTitle: OperatorMailingAddressTitle,
        },
      },
    },
  },
  regulated_products: {
    "ui:widget": "MultiSelectWidget",
    "ui:placeholder": "Select regulated products",
  },
  reporting_activities: {
    "ui:widget": "MultiSelectWidget",
    "ui:placeholder": "Select reporting activities",
  },
  postal_code: {
    "ui:widget": "PostalCodeWidget",
  },
  phone_number: {
    "ui:widget": "PhoneWidget",
  },
};
