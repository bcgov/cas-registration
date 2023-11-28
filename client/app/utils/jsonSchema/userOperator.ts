import { RJSFSchema } from "@rjsf/utils";
import provinceOptions from "@/app/data/provinces.json";
import FieldTemplate from "@/app/styles/rjsf/FieldTemplate";
import GroupTitleFieldTemplate from "@/app/styles/rjsf/GroupTitleFieldTemplate";
import TitleOnlyFieldTemplate from "@/app/styles/rjsf/TitleOnlyFieldTemplate";
import {
  OperatorMailingAddressTitle,
  OperatorPhysicalAddressTitle,
  ParentCompanyMailingAddressTitle,
  ParentCompanyPhysicalAddressTitle,
  SeniorOfficerTitle,
} from "@/app/components/form/titles/userOperatorTitles";

const subheading = {
  "ui:classNames": "text-bc-bg-blue text-start text-lg",
  "ui:FieldTemplate": TitleOnlyFieldTemplate,
};

const userOperatorPage1: RJSFSchema = {
  type: "object",
  title: "Operator Information",
  required: [
    "legal_name",
    "cra_business_number",
    "bc_corporate_registry_number",
    "business_structure",
    "physical_street_address",
    "physical_municipality",
    "physical_province",
    "physical_postal_code",
    "operator_has_parent_company",
  ],
  properties: {
    legal_name: { type: "string", title: "Legal Name" },
    trade_name: { type: "string", title: "Trade Name" },
    cra_business_number: {
      type: "number",
      title: "CRA Business Number",
    },
    bc_corporate_registry_number: {
      type: "number",
      title: "BC Corporate Registry Number",
    },
    business_structure: {
      type: "string",
      title: "Business Structure",
      anyOf: [],
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
          has_parent_company_section: {
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
            anyOf: [],
          },
          pc_website: { type: "string", title: "Website" },
          percentage_owned_by_parent_company: {
            type: "number",
            title: "Percentage of ownership of operator (%)",
          },
          pc_physical_address_section: {
            //Not an actual field in the db - this is just to make the form look like the wireframes
            title:
              "Please provide information about the physical address of the parent company:",
            type: "object",
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
          pc_mailing_address_section: {
            //Not an actual field in the db - this is just to make the form look like the wireframes
            title:
              "Please provide information about the mailing address of the parent company:",
            type: "object",
            readOnly: true,
          },
          pc_mailing_address_same_as_physical: {
            title: "Is the mailing address the same as the physical address?",
            type: "boolean",
            default: true,
          },
        },
        allOf: [
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
  ],
};

const userOperatorPage2: RJSFSchema = {
  type: "object",
  title: "User Information",
  required: [
    "is_senior_officer",
    "position_title",
    "street_address",
    "municipality",
    "province",
    "postal_code",
    "email",
    "phone_number",
  ],
  properties: {
    is_senior_officer: {
      title: "Are you a senior officer of the operator?",
      type: "boolean",
      default: true,
    },
    senior_officer_section: {
      title:
        "Please provide information about the Senior Officer (SO) of the Operator:",
      type: "object",
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
        required: ["first_name", "last_name", "so_email", "so_phone_number"],
        properties: {
          first_name: {
            type: "string",
            title: "First Name",
          },
          last_name: {
            type: "string",
            title: "Last Name",
          },
          so_email: {
            type: "string",
            title: "Email Address",
            default: "",
          },
          so_phone_number: {
            type: "string",
            title: "Phone Number",
            format: "phone",
            default: "",
          },
        },
      },
      else: {
        type: "object",
        required: ["email", "phone_number"],
        properties: {
          email: {
            type: "string",
            title: "Email Address",
            readOnly: true,
          },
          phone_number: {
            type: "string",
            title: "Phone Number",
            format: "phone",
            readOnly: true,
          },
        },
      },
    },
  ],
};

export const userOperatorSchema: RJSFSchema = {
  type: "object",
  properties: {
    userOperatorPage1,
    userOperatorPage2,
  },
};

export const userOperatorUiSchema = {
  "ui:order": [
    "is_senior_officer",
    "senior_officer_section",
    "first_name",
    "last_name",
    "position_title",
    "street_address",
    "municipality",
    "province",
    "postal_code",
    "email",
    "phone_number",
    // so = senior officer
    "so_email",
    "so_phone_number",
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
    "has_parent_company_section",

    // pc = parent company
    "pc_legal_name",
    "pc_trade_name",
    "pc_cra_business_number",
    "pc_bc_corporate_registry_number",
    "pc_business_structure",
    "pc_website",
    "percentage_owned_by_parent_company",
    "pc_physical_address_section",
    "pc_physical_street_address",
    "pc_physical_municipality",
    "pc_physical_province",
    "pc_physical_postal_code",
    "pc_mailing_address_section",
    "pc_mailing_address_same_as_physical",
    "pc_mailing_street_address",
    "pc_mailing_municipality",
    "pc_mailing_province",
    "pc_mailing_postal_code",
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
  senior_officer_section: {
    ...subheading,
    "ui:options": {
      jsxTitle: SeniorOfficerTitle,
    },
  },
  so_email: {
    "ui:widget": "EmailWidget",
  },
  mailing_address_section: {
    ...subheading,
    "ui:options": {
      jsxTitle: OperatorMailingAddressTitle,
    },
  },
  physical_address_section: {
    ...subheading,
    "ui:options": {
      jsxTitle: OperatorPhysicalAddressTitle,
    },
  },
  operator_has_parent_company: {
    "ui:widget": "RadioWidget",
  },
  has_parent_company_section: {
    "ui:classNames": "form-heading",
    "ui:FieldTemplate": TitleOnlyFieldTemplate,
  },
  pc_mailing_address_section: {
    ...subheading,
    "ui:options": {
      jsxTitle: ParentCompanyMailingAddressTitle,
    },
  },
  pc_physical_address_section: {
    ...subheading,
    "ui:options": {
      jsxTitle: ParentCompanyPhysicalAddressTitle,
    },
  },
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
    "ui:placeholder": "Select a province",
  },
  physical_province: {
    "ui:widget": "ComboBox",
    "ui:placeholder": "Select a province",
  },
  pc_physical_province: {
    "ui:widget": "ComboBox",
    "ui:placeholder": "Select a province",
  },
  province: {
    "ui:widget": "ComboBox",
    "ui:placeholder": "Select a province",
  },
  mailing_province: {
    "ui:widget": "ComboBox",
    "ui:placeholder": "Select a province",
  },
  business_structure: {
    "ui:widget": "ComboBox",
    "ui:placeholder": "Select a business structure",
  },
  pc_business_structure: {
    "ui:widget": "ComboBox",
    "ui:placeholder": "Select a business structure",
  },
  phone_number: {
    "ui:widget": "PhoneWidget",
  },
  so_phone_number: {
    "ui:widget": "PhoneWidget",
  },
};
