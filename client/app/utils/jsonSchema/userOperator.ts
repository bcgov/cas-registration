import { RJSFSchema } from "@rjsf/utils";

const provinceOptions = [
  {
    const: "AB",
    title: "Alberta",
  },
  {
    const: "BC",
    title: "British Columbia",
  },
  {
    const: "MB",
    title: "Manitoba",
  },
  {
    const: "NB",
    title: "New Brunswick",
  },
  {
    const: "NL",
    title: "Newfoundland and Labrador",
  },
  {
    const: "NT",
    title: "Northwest Territories",
  },
  {
    const: "NS",
    title: "Nova Scotia",
  },
  {
    const: "NU",
    title: "Nunavut",
  },
  {
    const: "ON",
    title: "Ontario",
  },
  {
    const: "PE",
    title: "Prince Edward Island",
  },
  {
    const: "QC",
    title: "Quebec",
  },
  {
    const: "SK",
    title: "Saskatchewan",
  },
  {
    const: "YT",
    title: "Yukon",
  },
];

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
    "operator_has_parent_company",
  ],
  properties: {
    user_information: {
      //Not an actual field in the db - this is just to make the form look like the wireframes
      type: "object",
      title: "User Information",
      readOnly: true,
    },
    first_name: { type: "string", title: "First Name" },
    last_name: { type: "string", title: "Last Name" },
    position_title: { type: "string", title: "Position Title" },
    street_address: { type: "string", title: "Mailing Address" },
    municipality: { type: "string", title: "Municipality" },
    province: {
      type: "string",
      title: "Province",
      oneOf: provinceOptions,
    },
    postal_code: { type: "string", title: "Postal Code" },
    email: { type: "string", title: "Email Address" },
    phone_number: { type: "string", title: "Phone Number" },
    // temporary handling of many-to-many fields, will be addressed in #138
    // file: {
    //   title: "Signed Statutory Declaration",
    //   type: "string",
    //   format: "data-url",
    // },
    role: {
      title: "Are you a senior officer of the operator?",
      type: "boolean",
      default: true,
    },
    operator_information: {
      //Not an actual field in the db - this is just to make the form look like the wireframes
      type: "object",
      title: "Operator Information",
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
    website: { type: "string", title: "Website (optional)" },
    operator_has_parent_company: {
      title: "Does the operator have a parent company?",
      type: "boolean",
      default: false,
    },
    physical_address_section: {
      title:
        "Please provide information about the physical address of this operator:",
      type: "object",
    },
    physical_street_address: {
      type: "string",
      title: "Physical Address",
    },
    physical_municipality: {
      type: "string",
      title: "Municipality",
    },
    physical_province: {
      type: "string",
      title: "Province",
      anyOf: provinceOptions,
    },
    physical_postal_code: {
      type: "string",
      title: "Postal Code",
    },
    mailing_address_section: {
      title:
        "Please provide information about the mailing address of this operator:",
      type: "object",
    },
    mailing_address_same_as_physical: {
      title: "Is the mailing address the same as the physical address?",
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
              "Please provide information about the Senior Officer (SO) of the Operator:",
            type: "object",
            readOnly: true,
          },
          so_first_name: {
            type: "string",
            title: "First Name",
          },
          so_last_name: {
            type: "string",
            title: "Last Name",
          },
          so_position_title: {
            type: "string",
            title: "Position Title",
          },
          so_street_address: {
            type: "string",
            title: "Mailing Address",
          },
          so_municipality: {
            type: "string",
            title: "Municipality",
          },
          so_province: {
            type: "string",
            title: "Province",
            anyOf: provinceOptions,
          },
          so_postal_code: {
            type: "string",
            title: "Postal Code",
          },
          so_email: {
            type: "string",
            title: "Email Address",
          },
          so_phone_number: {
            type: "string",
            title: "Phone Number",
          },
          // temporary handling of many-to-many fields, will be addressed in #138
          // "Proof of authority of operation representative from a SO": {
          //   type: "string",
          //   format: "data-url",
          // },
        },
      },
    },
    {
      if: {
        properties: {
          operator_has_parent_company: {
            const: true,
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
          "parent_company_mailing_address_same_as_physical",
        ],
        properties: {
          has_parent_company: {
            //Not an actual field in the db - this is just to make the form look like the wireframes
            title: "Parent Company Information",
            type: "object",
          },
          pc_legal_name: {
            type: "string",
            title: "Legal Name",
          },
          pc_trade_name: {
            type: "string",
            title: "Trade Name",
          },
          pc_cra_business_number: {
            type: "number",
            title: "CRA Business Number",
          },
          pc_bc_corporate_registry_number: {
            type: "number",
            title: "BC Corporate Registry Number",
          },
          pc_business_structure: {
            type: "string",
            title: "Business Structure",
          },
          pc_website: { type: "string", title: "Website" },
          percentage_owned_by_parent_company: {
            type: "number",
            title: "Percentage of ownership of operator (%)",
          },
          pc_physical_street_address: {
            type: "string",
            title: "Physical Address",
          },
          pc_physical_municipality: {
            type: "string",
            title: "PA Municipality",
          },
          pc_physical_province: {
            type: "string",
            title: "PA Province",
            anyOf: provinceOptions,
          },
          pc_physical_postal_code: {
            type: "string",
            title: "PA Postal Code",
          },
          parent_company_mailing_address_same_as_physical: {
            title: "Is the mailing address the same as the physical address?",
            type: "boolean",
            default: true,
          },
        },
      },
    },
    {
      if: {
        properties: {
          mailing_address_same_as_physical: {
            const: false,
          },
        },
      },
      then: {
        type: "object",
        required: [
          "mailing_street_address",
          "mailing_municipality",
          "mailing_province",
          "mailing_postal_code",
        ],
        properties: {
          mailing_address_section: {
            //Not an actual field in the db - this is just to make the form look like the wireframes
            title: "Mailing Address",
            type: "object",
            readOnly: true,
          },
          mailing_street_address: {
            type: "string",
            title: "Mailing Address",
          },
          mailing_municipality: {
            type: "string",
            title: "Municipality",
          },
          mailing_province: {
            type: "string",
            title: "Province",
            anyOf: provinceOptions,
          },
          mailing_postal_code: {
            type: "string",
            title: "Postal Code",
          },
        },
      },
    },
    {
      if: {
        properties: {
          parent_company_mailing_address_same_as_physical: {
            const: false,
          },
        },
      },
      then: {
        type: "object",
        required: [
          "pc_mailing_street_address",
          "pc_mailing_municipality",
          "pc_mailing_province",
          "pc_mailing_postal_code",
        ],
        properties: {
          pc_mailing_address_section: {
            //Not an actual field in the db - this is just to make the form look like the wireframes
            title:
              "Please provide information about the mailing address of this operator:",
            type: "object",
            readOnly: true,
          },
          pc_mailing_street_address: {
            type: "string",
            title: "Mailing Address",
          },
          pc_mailing_municipality: {
            type: "string",
            title: "Municipality",
          },
          pc_mailing_province: {
            type: "string",
            title: "Province",
            anyOf: provinceOptions,
          },
          pc_mailing_postal_code: {
            type: "string",
            title: "Postal Code",
          },
        },
      },
    },
  ],
};

export const userOperatorUiSchema = {
  "ui:order": [
    "user_information",
    "first_name",
    "last_name",
    "position_title",
    "street_address",
    "municipality",
    "province",
    "postal_code",
    "email",
    "phone_number",
    // "file", temporary handling of many-to-many fields, will be addressed in #138
    "role",
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
    "operator_information",
    "legal_name",
    "trade_name",
    "cra_business_number",
    "bc_corporate_registry_number",
    "business_structure",
    "website",
    "operator_has_parent_company",
    "physical_address_section",
    "physical_street_address",
    "physical_municipality",
    "physical_province",
    "physical_postal_code",
    "mailing_address_section",
    "mailing_address_same_as_physical",
    "mailing_street_address",
    "mailing_municipality",
    "mailing_province",
    "mailing_postal_code",
    "has_parent_company",
    "pc_legal_name",
    "pc_trade_name",
    "pc_cra_business_number",
    "pc_bc_corporate_registry_number",
    "pc_business_structure",
    "pc_website",
    "percentage_owned_by_parent_company",
    "pc_physical_street_address",
    "pc_physical_municipality",
    "pc_physical_province",
    "pc_physical_postal_code",
    "parent_company_mailing_address_same_as_physical",
    "pc_mailing_address_section",
    "pc_mailing_street_address",
    "pc_mailing_municipality",
    "pc_mailing_province",
    "pc_mailing_postal_code",
  ],
  user_information: {
    "ui:classNames": "text-bc-gov-primary-brand-color-blue text-start",
  },
  email: {
    "ui:widget": "EmailWidget",
  },
  role: {
    "ui:widget": "SelectWidget",
  },
  not_senior_officer: {
    "ui:classNames": "text-bc-gov-primary-brand-color-blue text-start",
  },
  so_email: {
    "ui:widget": "EmailWidget",
  },
  operator_information: {
    "ui:classNames": "text-bc-gov-primary-brand-color-blue text-start mt-40",
  },
  operator_has_parent_company: {
    "ui:widget": "SelectWidget",
  },
  has_parent_company: {
    "ui:classNames": "text-bc-gov-primary-brand-color-blue text-start",
  },
  mailing_address_same_as_physical: {
    "ui:widget": "SelectWidget",
  },
  parent_company_mailing_address_same_as_physical: {
    "ui:widget": "SelectWidget",
  },
  website: {
    "ui:widget": "URLWidget",
  },
  pc_website: {
    "ui:widget": "URLWidget",
  },
};
