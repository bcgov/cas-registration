import { RJSFSchema } from "@rjsf/utils";
import provinceOptions from "@/app/data/provinces.json";
import FieldTemplate from "@/app/styles/rjsf/FieldTemplate";
import GroupTitleFieldTemplate from "@/app/styles/rjsf/GroupTitleFieldTemplate";
import TitleOnlyFieldTemplate from "@/app/styles/rjsf/TitleOnlyFieldTemplate";

const subheading = {
  "ui:classNames": "text-bc-gov-primary-brand-color-blue text-start text-lg",
  "ui:FieldTemplate": TitleOnlyFieldTemplate,
};

const userOperatorPage1: RJSFSchema = {
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
    "is_senior_officer",
    // "file", temporary handling of many-to-many fields, will be addressed in #138
    "legal_name",
    "business_structure",
    "physical_street_address",
    "physical_municipality",
    "physical_province",
    "physical_postal_code",
    "operator_has_parent_company",
  ],
  title: "User Information",
  properties: {
    first_name: { type: "string", title: "First Name" },
    last_name: { type: "string", title: "Last Name" },
    position_title: { type: "string", title: "Position Title" },
    street_address: { type: "string", title: "Mailing Address" },
    municipality: { type: "string", title: "Municipality" },
    province: {
      type: "string",
      title: "Province",
      anyOf: provinceOptions,
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
    is_senior_officer: {
      title: "Are you a senior officer of the operator?",
      type: "boolean",
      default: true,
    },
  },
  allOf: [
    {
      if: {
        properties: {
          is_senior_officer: {
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
  ],
};

const userOperatorPage2: RJSFSchema = {
  type: "object",
  title: "Operator Information",
  properties: {
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
          "pc_mailing_address_same_as_physical",
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
          pc_mailing_address_same_as_physical: {
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
          pc_mailing_address_same_as_physical: {
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

export const userOperatorSchema: RJSFSchema = {
  type: "object",
  title: "Operation",
  properties: {
    userOperatorPage1,
    userOperatorPage2,
  },
};

export const userOperatorUiSchema = {
  "ui:order": [
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
    "is_senior_officer",
    // "Proof of authority of operation representative from a SO", temporary handling of many-to-many fields, will be addressed in #138
    // so = senior officer
    "so_first_name",
    "so_last_name",
    "so_position_title",
    "so_street_address",
    "so_municipality",
    "so_province",
    "so_postal_code",
    "so_email",
    "so_phone_number",
    "legal_name",
    "trade_name",
    "cra_business_number",
    "bc_corporate_registry_number",
    "business_structure",
    "website",
    "operator_has_parent_company",
    // pc = parent company
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
    "pc_mailing_address_same_as_physical",
    "pc_mailing_street_address",
    "pc_mailing_municipality",
    "pc_mailing_province",
    "pc_mailing_postal_code",

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
  ],
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  "ui:TitleFieldTemplate": GroupTitleFieldTemplate,
  "ui:options": {
    label: false,
  },
  email: {
    "ui:widget": "EmailWidget",
  },
  is_senior_officer: {
    "ui:widget": "RadioWidget",
  },
  senior_officer_section: subheading,
  so_email: {
    "ui:widget": "EmailWidget",
  },
  mailing_address_section: subheading,
  physical_address_section: subheading,
  operator_has_parent_company: {
    "ui:widget": "RadioWidget",
  },
  has_parent_company: subheading,
  mailing_address_same_as_physical: {
    "ui:widget": "RadioWidget",
  },
  pc_mailing_address_same_as_physical: {
    "ui:widget": "RadioWidget",
  },
  website: {
    "ui:widget": "URLWidget",
  },
  pc_website: {
    "ui:widget": "URLWidget",
  },
  pc_mailing_province: {
    "ui:widget": "ComboBox",
  },
  province: {
    "ui:widget": "ComboBox",
  },
  physical_province: {
    "ui:widget": "ComboBox",
  },
  pc_physical_province: {
    "ui:widget": "ComboBox",
  },
  so_province: {
    "ui:widget": "ComboBox",
  },
};
