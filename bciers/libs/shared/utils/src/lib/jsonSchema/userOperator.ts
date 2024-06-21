import { RJSFSchema } from "@rjsf/utils";
import provinceOptions from "@/app/data/provinces.json";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import TitleOnlyFieldTemplate from "@bciers/components/form/fields/TitleOnlyFieldTemplate";
import {
  OperatorMailingAddressTitle,
  OperatorPhysicalAddressTitle,
  ParentCompanyMailingAddressTitle,
  ParentCompanyPhysicalAddressTitle,
  SeniorOfficerTitle,
} from "@/app/components/form/titles/userOperatorTitles";
import ArrayFieldTemplate from "@bciers/components/form/fields/ArrayFieldTemplate";

const subheading = {
  "ui:classNames": "text-bc-bg-blue text-start text-lg",
  "ui:FieldTemplate": TitleOnlyFieldTemplate,
};

export const userOperatorPage1: RJSFSchema = {
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
    "parent_operators_section",
  ],
  properties: {
    legal_name: { type: "string", title: "Legal Name" },
    trade_name: { type: "string", title: "Trade Name" },
    cra_business_number: {
      type: "number",
      title: "CRA Business Number",
      minimum: 100000000,
      maximum: 999999999,
    },
    bc_corporate_registry_number: {
      type: "string",
      title: "BC Corporate Registry Number",
      format: "bc_corporate_registry_number",
    },
    business_structure: {
      type: "string",
      title: "Business Structure",
      anyOf: [],
    },
    website: { type: "string", title: "Website (optional)", format: "uri" },
    parent_operators_section: {
      //Not an actual field in the db - this is just to make the form look like the wireframes
      title: "Parent Company Information",
      type: "object",
      readOnly: true,
    },
    operator_has_parent_operators: {
      title: "Does this operator have one or more parent company?",
      type: "boolean",
      default: false,
    },
    physical_address_section: {
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
      format: "postal-code",
    },
    mailing_address_section: {
      type: "object",
    },
    mailing_address_same_as_physical: {
      title:
        "Is the business mailing address the same as the physical address?",
      type: "boolean",
      default: true,
    },
  },
  allOf: [
    {
      if: {
        properties: {
          operator_has_parent_operators: {
            const: true,
          },
        },
      },
      then: {
        properties: {
          parent_operators_array: {
            type: "array",
            default: [{}],
            items: {
              type: "object",
              required: [
                // po = parent operator
                "po_legal_name",
                "po_cra_business_number",
                "po_bc_corporate_registry_number",
                "po_business_structure",
                "po_physical_street_address",
                "po_physical_municipality",
                "po_physical_province",
                "po_physical_postal_code",
              ],
              properties: {
                po_legal_name: {
                  type: "string",
                  title: "Legal Name",
                },
                po_trade_name: {
                  type: "string",
                  title: "Trade Name",
                },
                po_cra_business_number: {
                  type: "number",
                  title: "CRA Business Number",
                  minimum: 100000000,
                  maximum: 999999999,
                },
                po_bc_corporate_registry_number: {
                  type: "string",
                  title: "BC Corporate Registry Number",
                  format: "bc_corporate_registry_number",
                },
                po_business_structure: {
                  type: "string",
                  title: "Business Structure",
                },
                po_website: {
                  type: "string",
                  title: "Website (optional)",
                  format: "uri",
                },
                po_physical_address_section: {
                  //Not an actual field in the db - this is just to make the form look like the wireframes
                  type: "object",
                  readOnly: true,
                },
                po_physical_street_address: {
                  type: "string",
                  title: "Physical Address",
                },
                po_physical_municipality: {
                  type: "string",
                  title: "Municipality",
                },
                po_physical_province: {
                  type: "string",
                  title: "Province",
                  anyOf: provinceOptions,
                },
                po_physical_postal_code: {
                  type: "string",
                  title: "Postal Code",
                  format: "postal-code",
                },
                po_mailing_address_section: {
                  type: "object",
                  readOnly: true,
                },
                po_mailing_address_same_as_physical: {
                  title:
                    "Is the business mailing address the same as the physical address?",
                  type: "boolean",
                  default: true,
                },
                operator_index: {
                  type: "number",
                },
              },
              allOf: [
                {
                  if: {
                    properties: {
                      po_mailing_address_same_as_physical: {
                        const: false,
                      },
                    },
                  },
                  then: {
                    required: [
                      "po_mailing_street_address",
                      "po_mailing_municipality",
                      "po_mailing_province",
                      "po_mailing_postal_code",
                    ],
                    properties: {
                      po_mailing_street_address: {
                        type: "string",
                        title: "Business Mailing Address",
                      },
                      po_mailing_municipality: {
                        type: "string",
                        title: "Municipality",
                      },
                      po_mailing_province: {
                        type: "string",
                        title: "Province",
                        anyOf: provinceOptions,
                      },
                      po_mailing_postal_code: {
                        type: "string",
                        title: "Postal Code",
                        format: "postal-code",
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
            type: "object",
            readOnly: true,
          },
          mailing_street_address: {
            type: "string",
            title: "Business Mailing Address",
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
            format: "postal-code",
          },
        },
      },
    },
  ],
};

export const userOperatorPage2: RJSFSchema = {
  type: "object",
  title: "User Information",
  required: [
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
      title: "If you are the Senior Officer of the Operator check this box",
      type: "boolean",
      default: false,
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
      title: "Business Mailing Address",
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
            format: "email",
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
            format: "email",
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

export const userOperatorUserInformationPage2: RJSFSchema = {
  type: "object",
  title: "User Information",
  properties: {
    first_name: {
      type: "string",
      title: "First Name",
    },
    last_name: {
      type: "string",
      title: "Last Name",
    },
    bceid_business_name: {
      type: "string",
      title: "BCeID Business Name",
    },
    position_title: {
      type: "string",
      title: "Position Title",
    },
    email: {
      type: "string",
      title: "Email Address",
      format: "email",
      readOnly: true,
    },
    phone_number: {
      type: "string",
      title: "Phone Number",
      format: "phone",
      readOnly: true,
    },
  },
};

export const userOperatorSchema: RJSFSchema = {
  type: "object",
  properties: {
    userOperatorPage1,
  },
};

export const userOperatorInternalUserSchema: RJSFSchema = {
  type: "object",
  properties: {
    userOperatorPage1,
    userOperatorUserInformationPage2,
  },
};

export const userOperatorUiSchema = {
  "ui:order": [
    // contact info
    "first_name",
    "last_name",
    "bceid_business_name",
    "position_title",
    "email",
    "phone_number",
    // so = senior officer
    "so_email",
    "so_phone_number",
    // operator info
    "legal_name",
    "trade_name",
    "cra_business_number",
    "bc_corporate_registry_number",
    "business_structure",
    "website",
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
    // po = parent operator
    "parent_operators_section",
    "operator_has_parent_operators",
    "parent_operators_array",
    "po_legal_name",
    "po_trade_name",
    "po_cra_business_number",
    "po_bc_corporate_registry_number",
    "po_business_structure",
    "po_website",
    "po_physical_address_section",
    "po_physical_street_address",
    "po_physical_municipality",
    "po_physical_province",
    "po_physical_postal_code",
    "po_mailing_address_same_as_physical",
    "po_mailing_address_section",
    "po_mailing_street_address",
    "po_mailing_municipality",
    "po_mailing_province",
    "po_mailing_postal_code",
  ],
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  // CONTACT INFO SECTION
  email: {
    "ui:widget": "EmailWidget",
  },
  province: {
    "ui:widget": "ComboBox",
    "ui:placeholder": "Select a province",
  },
  is_senior_officer: {
    "ui:widget": "CheckboxWidget",
    "ui:options": {
      label: false,
    },
  },
  senior_officer_section: {
    ...subheading,
    "ui:title": SeniorOfficerTitle,
  },
  so_email: {
    "ui:widget": "EmailWidget",
  },
  phone_number: {
    "ui:widget": "PhoneWidget",
  },
  so_phone_number: {
    "ui:widget": "PhoneWidget",
  },
  postal_code: {
    "ui:widget": "PostalCodeWidget",
  },
  // OPERATOR INFO SECTION
  mailing_address_section: {
    ...subheading,
    "ui:title": OperatorMailingAddressTitle,
  },
  physical_address_section: {
    ...subheading,
    "ui:title": OperatorPhysicalAddressTitle,
  },
  mailing_address_same_as_physical: {
    "ui:widget": "RadioWidget",
  },
  website: {
    "ui:widget": "URLWidget",
  },
  physical_province: {
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
  physical_postal_code: {
    "ui:widget": "PostalCodeWidget",
  },
  mailing_postal_code: {
    "ui:widget": "PostalCodeWidget",
  },
  // PARENT OPERATORS SECTION
  parent_operators_section: {
    ...subheading,
  },
  operator_has_parent_operators: {
    "ui:FieldTemplate": FieldTemplate,
    "ui:widget": "RadioWidget",
  },
  parent_operators_array: {
    "ui:FieldTemplate": FieldTemplate,
    "ui:ArrayFieldTemplate": ArrayFieldTemplate,
    "ui:options": {
      label: false,
      arrayAddLabel: "Add another parent company",
      title: "Parent Company Information - Parent Company",
    },
    items: {
      po_physical_address_section: {
        ...subheading,
        "ui:title": ParentCompanyPhysicalAddressTitle,
      },
      po_mailing_address_same_as_physical: {
        "ui:widget": "RadioWidget",
      },
      po_business_structure: {
        "ui:widget": "ComboBox",
        "ui:placeholder": "Select a business structure",
      },
      po_physical_province: {
        "ui:widget": "ComboBox",
        "ui:placeholder": "Select a province",
      },
      po_mailing_province: {
        "ui:widget": "ComboBox",
        "ui:placeholder": "Select a province",
      },
      po_mailing_address_section: {
        ...subheading,
        "ui:title": ParentCompanyMailingAddressTitle,
      },
      po_physical_postal_code: {
        "ui:widget": "PostalCodeWidget",
      },
      po_mailing_postal_code: {
        "ui:widget": "PostalCodeWidget",
      },
      operator_index: { "ui:widget": "hidden" },
    },
  },
};

export const userOperatorInternalUserUiSchema = {
  ...userOperatorUiSchema,
  // Remove headings since titles are displayed in Accordion header
  "ui:options": {
    label: false,
  },
};
