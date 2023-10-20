import { RJSFSchema } from "@rjsf/utils";

export const userOperatorSchema: RJSFSchema = {
  type: "object",
  required: [
    "first_name",
    "last_name",
    "position_title",
    "street_address",
    "municipality",
    "postal_code",
    "email",
    "phone_number",
    "province",
    "role",
    // "file", temporary handling of many-to-many fields, will be addressed in #138
    "legal_name",
    "business_structure",
    "physical_street_address",
    "physical_municipality",
    "physical_province",
    "physical_postal_code",
    "mailing_street_address",
    "mailing_municipality",
    "mailing_province",
    "mailing_postal_code",
    "operator_has_parent_company",
  ],
  properties: {
    step_1: {
      //Not an actual field in the db - this is just to make the form look like the wireframes
      type: "object",
      title: "Step 1. User Information",
      readOnly: true,
    },
    first_name: { type: "string", title: "First Name" },
    last_name: { type: "string", title: "Last Name" },
    position_title: { type: "string", title: "Position Title" },
    street_address: { type: "string", title: "Mailing Address" },
    municipality: { type: "string", title: "Municipality" },
    postal_code: { type: "string", title: "Postal Code" },
    email: { type: "string", title: "Email Address" },
    phone_number: { type: "string", title: "Phone Number" },
    province: { type: "string", title: "Province" },
    role: {
      title: "Are you a senior officer of the operator?",
      type: "boolean",
      default: true,
    },
    // temporary handling of many-to-many fields, will be addressed in #138
    // file: {
    //   title: "Signed Statutory Declaration",
    //   type: "string",
    //   format: "data-url",
    // },
    step_2: {
      //Not an actual field in the db - this is just to make the form look like the wireframes
      type: "object",
      title: "Step 2. Operator Information",
      readOnly: true,
    },
    legal_name: { type: "string", title: "Legal Name" },
    trade_name: { type: "string", title: "Trade Name" },
    cra_business_number: {
      type: "number",
      title: "CRA Business Number",
      readOnly: true,
    },
    bc_corporate_registry_number: {
      type: "number",
      title: "BC Corporate Registry Number",
      readOnly: true,
    },
    business_structure: {
      type: "string",
      title: "Business Structure",
    },
    physical_street_address: {
      type: "string",
      title: "Physical Address (PA)",
    },
    physical_municipality: {
      type: "string",
      title: "PA Municipality",
    },
    physical_province: {
      type: "string",
      title: "PA Province",
    },
    physical_postal_code: {
      type: "string",
      title: "PA Postal Code",
    },
    mailing_street_address: {
      type: "string",
      title: "Mailing Address (MA)",
    },
    mailing_municipality: {
      type: "string",
      title: "MA Municipality",
    },
    mailing_province: {
      type: "string",
      title: "MA Province",
    },
    mailing_postal_code: {
      type: "string",
      title: "MA Postal Code",
    },
    website: { type: "string", title: "Website" },
    operator_has_parent_company: {
      title: "Does the operator have a parent company?",
      type: "boolean",
      default: true,
    },
  },
  allOf: [
    {
      if: {
        properties: {
          role: {
            const: false,
          },
        },
      },
      then: {
        type: "object",
        required: [
          // "Proof of authority of operation representative from a SO", uncomment when we have document upload working
          "so_first_name",
          "so_last_name",
          "so_position_title",
          "so_street_address",
          "so_municipality",
          "so_province",
          "so_postal_code",
          "so_email",
          "so_phone_number",
        ],
        properties: {
          not_senior_officer: {
            //Not an actual field in the db - this is just to make the form look like the wireframes
            title:
              "If user is not senior officer (SO) - Ignore this section if you selected 'Yes'",
            type: "object",
            readOnly: true,
          },
          // temporary handling of many-to-many fields, will be addressed in #138
          // "Proof of authority of operation representative from a SO": {
          //   type: "string",
          //   format: "data-url",
          // },
          so_first_name: {
            type: "string",
            title: "SO First Name",
          },
          so_last_name: {
            type: "string",
            title: "SO Last Name",
          },
          so_position_title: {
            type: "string",
            title: "SO Position Title",
          },
          so_street_address: {
            type: "string",
            title: "SO Mailing Address",
          },
          so_municipality: {
            type: "string",
            title: "SO Municipality",
          },
          so_province: {
            type: "string",
            title: "SO Province",
          },
          so_postal_code: {
            type: "string",
            title: "SO Postal Code",
          },
          so_email: {
            type: "string",
            title: "SO Email Address",
          },
          so_phone_number: {
            type: "string",
            title: "SO Phone Number",
          },
        },
      },
    },
    {
      if: {
        properties: {
          operator_has_parent_company: {
            const: false,
          },
        },
      },
      then: {
        type: "object",
        required: [
          "pc_legal_name",
          "pc_cra_business_number",
          "pc_bc_corporate_registry_number",
          "pc_business_structure",
          "pc_physical_street_address",
          "pc_physical_municipality",
          "pc_physical_province",
          "pc_physical_postal_code",
          "pc_mailing_street_address",
          "pc_mailing_municipality",
          "pc_mailing_province",
          "pc_mailing_postal_code",
        ],
        properties: {
          has_parent_company: {
            //Not an actual field in the db - this is just to make the form look like the wireframes
            title:
              "If operator has parent company (PC) - Ignore this section if you selected 'Yes'",
            type: "object",
            readOnly: true,
          },
          pc_legal_name: {
            type: "string",
            title: "PC Legal Name",
          },
          pc_trade_name: {
            type: "string",
            title: "PC Trade Name",
          },
          pc_cra_business_number: {
            type: "number",
            title: "PC CRA Business Number",
          },
          pc_bc_corporate_registry_number: {
            type: "number",
            title: "PC BC Corporate Registry Number",
          },
          pc_business_structure: {
            type: "string",
            title: "PC Business Structure",
          },
          pc_physical_street_address: {
            type: "string",
            title: "PC Physical Address",
          },
          pc_physical_municipality: {
            type: "string",
            title: "PC PA Municipality",
          },
          pc_physical_province: {
            type: "string",
            title: "PC PA Province",
          },
          pc_physical_postal_code: {
            type: "string",
            title: "PC PA Postal Code",
          },
          pc_mailing_street_address: {
            type: "string",
            title: "PC Mailing Address",
          },
          pc_mailing_municipality: {
            type: "string",
            title: "PC MA Municipality",
          },
          pc_mailing_province: {
            type: "string",
            title: "PC MA Province",
          },
          pc_mailing_postal_code: {
            type: "string",
            title: "PC MA Postal Code",
          },
          pc_website: { type: "string", title: "PC Website" },
          percentage_owned_by_parent_company: {
            type: "number",
            title: "Percentage of ownership of operator",
          },
        },
      },
    },
  ],
};

export const userOperatorUiSchema = {
  "ui:order": [
    "step_1",
    "first_name",
    "last_name",
    "position_title",
    "street_address",
    "municipality",
    "postal_code",
    "email",
    "phone_number",
    "province",
    "role",
    // "file", temporary handling of many-to-many fields, will be addressed in #138
    "not_senior_officer",
    // "Proof of authority of operation representative from a SO", temporary handling of many-to-many fields, will be addressed in #138
    "so_first_name",
    "so_last_name",
    "so_position_title",
    "so_street_address",
    "so_municipality",
    "so_province",
    "so_postal_code",
    "so_email",
    "so_phone_number",
    "step_2",
    "legal_name",
    "trade_name",
    "cra_business_number",
    "bc_corporate_registry_number",
    "business_structure",
    "physical_street_address",
    "physical_municipality",
    "physical_province",
    "physical_postal_code",
    "mailing_street_address",
    "mailing_municipality",
    "mailing_province",
    "mailing_postal_code",
    "website",
    "operator_has_parent_company",
    "has_parent_company",
    "pc_legal_name",
    "pc_trade_name",
    "pc_cra_business_number",
    "pc_bc_corporate_registry_number",
    "pc_business_structure",
    "pc_physical_street_address",
    "pc_physical_municipality",
    "pc_physical_province",
    "pc_physical_postal_code",
    "pc_mailing_street_address",
    "pc_mailing_municipality",
    "pc_mailing_province",
    "pc_mailing_postal_code",
    "pc_website",
    "percentage_owned_by_parent_company",
  ],
  step_1: {
    "ui:classNames":
      "bg-bc-gov-primary-brand-color-blue text-white no-underline text-start ps-4 rounded",
  },
  email: {
    "ui:widget": "EmailWidget",
  },
  role: {
    "ui:widget": "SelectWidget",
  },
  not_senior_officer: {
    "ui:classNames":
      "text-bc-gov-primary-brand-color-blue no-underline text-start ps-4 text-xs",
  },
  so_email: {
    "ui:widget": "EmailWidget",
  },
  step_2: {
    "ui:classNames":
      "bg-bc-gov-primary-brand-color-blue text-white no-underline text-start ps-4 rounded",
  },
  operator_has_parent_company: {
    "ui:widget": "SelectWidget",
  },
  has_parent_company: {
    "ui:classNames":
      "text-bc-gov-primary-brand-color-blue no-underline text-start ps-4 text-xs",
  },
  website: {
    "ui:widget": "URLWidget",
  },
  pc_website: {
    "ui:widget": "URLWidget",
  },
};
