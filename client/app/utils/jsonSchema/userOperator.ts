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
    "file",
    "legal_name",
    "trade_name",
    "cra_business_number",
    "bc_corporate_registry_number",
    "duns_number",
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
    "bceid",
    "Does the operator have a parent company?",
    "Is operator a compliance entity?",
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
      enum: ["Yes", "No"],
      default: "Yes",
    },
    file: {
      title: "Signed Statutory Declaration",
      type: "string",
      format: "data-url",
    },
    step_2: {
      //Not an actual field in the db - this is just to make the form look like the wireframes
      type: "object",
      title: "Step 2. Operator Information",
      readOnly: true,
    },
    legal_name: { type: "string", title: "Legal Name" },
    trade_name: { type: "string", title: "Trade Name" },
    cra_business_number: {
      type: "string",
      title: "CRA Business Number",
    },
    bc_corporate_registry_number: {
      type: "string",
      title: "BC Corporate Registry Number",
    },
    duns_number: {
      type: "string",
      title: "Dun & Bradstreet D-U-N-S Number",
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
    bceid: { type: "string", title: "BCeID" },
    "Does the operator have a parent company?": {
      enum: ["Yes", "No"],
      default: "Yes",
    },
    "Is operator a compliance entity?": {
      //FIXME: This question is not in the wireframes - waiting for designers to confirm
      enum: ["Yes", "No"],
      default: "Yes",
    },
  },
  allOf: [
    {
      if: {
        properties: {
          role: {
            const: "No",
          },
        },
      },
      then: {
        type: "object",
        required: [
          "Are you an operation representative of the operator?",
          "Proof of authority of operation representative from a SO",
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
          "Are you an operation representative of the operator?": {
            enum: ["Yes", "No"],
            default: "Yes", // have to set a default value to fix rendering flow
          },
          "Proof of authority of operation representative from a SO": {
            type: "string",
            format: "data-url",
          },
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
        allOf: [
          {
            if: {
              properties: {
                "Are you an operation representative of the operator?": {
                  const: "No",
                },
              },
            },
            then: {
              type: "object",
              required: [
                "Proof of authority of operation representative from a OR",
                "or_first_name",
                "or_last_name",
                "or_position_title",
                "or_street_address",
                "or_municipality",
                "or_province",
                "or_postal_code",
                "or_email",
                "or_phone_number",
              ],
              properties: {
                not_operation_representative: {
                  //Not an actual field in the db - this is just to make the form look like the wireframes
                  title:
                    "If user is not operation representative (OR) - Ignore this section if you selected 'Yes'",
                  type: "object",
                  readOnly: true,
                },
                "Proof of authority of operation representative from a OR": {
                  type: "string",
                  format: "data-url",
                },
                or_first_name: {
                  type: "string",
                  title: "OR First Name",
                },
                or_last_name: {
                  type: "string",
                  title: "OR Last Name",
                },
                or_position_title: {
                  type: "string",
                  title: "OR Position Title",
                },
                or_street_address: {
                  type: "string",
                  title: "OR Mailing Address",
                },
                or_municipality: {
                  type: "string",
                  title: "OR Municipality",
                },
                or_province: {
                  type: "string",
                  title: "OR Province",
                },
                or_postal_code: {
                  type: "string",
                  title: "OR Postal Code",
                },
                or_email: {
                  type: "string",
                  title: "OR Email Address",
                },
                or_phone_number: {
                  type: "string",
                  title: "OR Phone Number",
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
          "Does the operator have a parent company?": {
            const: "No",
          },
        },
      },
      then: {
        type: "object",
        required: [
          "pc_legal_name",
          "pc_trade_name",
          "pc_cra_business_number",
          "pc_bc_corporate_registry_number",
          "pc_duns_number",
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
          "pc_percentage_owned_by_parent_company",
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
            // FIXME: List of PC legal names?!
            type: "string",
            title: "PC Legal Name",
          },
          pc_trade_name: {
            type: "string",
            title: "PC Trade Name",
          },
          pc_cra_business_number: {
            type: "string",
            title: "PC CRA Business Number",
          },
          pc_bc_corporate_registry_number: {
            type: "string",
            title: "PC BC Corporate Registry Number",
          },
          pc_duns_number: {
            type: "string",
            title: "PC Dun & Bradstreet D-U-N-S Number",
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
          pc_percentage_owned_by_parent_company: {
            type: "number",
            title: "Percentage of ownership of operator",
          },
        },
      },
    },
    {
      if: {
        properties: {
          "Is operator a compliance entity?": {
            const: "Yes",
          },
        },
      },
      then: {
        properties: {
          compliance_entity: {
            title: "Legal Name of compliance entity",
            type: "string", //FIXME: we need a list of compliance entities
          },
        },
      },
    },
    {
      if: {
        properties: {
          "Is operator a compliance entity?": {
            const: "No",
          },
        },
      },
      then: {
        type: "object",
        required: [
          "aso_first_name",
          "aso_last_name",
          "aso_position_title",
          "aso_street_address",
          "aso_municipality",
          "aso_province",
          "aso_postal_code",
          "aso_email",
          "aso_phone_number",
          "Is ASO a senior officer of the compliance entity?",
        ],
        properties: {
          not_compliance_entity: {
            //Not an actual field in the db - this is just to make the form look like the wireframes
            title:
              "If operator is not compliance entity - Ignore this section if you selected 'Yes'",
            type: "object",
            readOnly: true,
          },
          aso_first_name: {
            type: "string",
            title: "ASO First Name",
          },
          aso_last_name: {
            type: "string",
            title: "ASO Last Name",
          },
          aso_position_title: {
            type: "string",
            title: "ASO Position Title",
          },
          aso_street_address: {
            type: "string",
            title: "ASO Mailing Address",
          },
          aso_municipality: {
            type: "string",
            title: "ASO Municipality",
          },
          aso_province: {
            type: "string",
            title: "ASO Province",
          },
          aso_postal_code: {
            type: "string",
            title: "ASO Postal Code",
          },
          aso_email: {
            type: "string",
            title: "ASO Email Address",
          },
          aso_phone_number: {
            type: "string",
            title: "ASO Phone Number",
          },
          "Is ASO a senior officer of the compliance entity?": {
            type: "string",
            enum: ["Yes", "No"],
            default: "Yes",
          },
        },
        allOf: [
          {
            if: {
              properties: {
                "Is ASO a senior officer of the compliance entity?": {
                  const: "No",
                },
              },
            },
            then: {
              type: "object",
              required: [
                "Proof of authority of operation representative from a ASO",
                "soce_first_name",
                "soce_last_name",
                "soce_position_title",
                "soce_street_address",
                "soce_municipality",
                "soce_province",
                "soce_postal_code",
                "soce_email",
                "soce_phone_number",
              ],
              properties: {
                is_not_senior_officer: {
                  //Not an actual field in the db - this is just to make the form look like the wireframes
                  title:
                    "If ASO is not senior officer of the compliance entity (SOCE) - Ignore this section if you selected 'Yes'",
                  type: "object",
                  readOnly: true,
                },
                "Proof of authority of ASO from a SOCE": {
                  type: "string",
                  format: "data-url",
                },
                soce_first_name: {
                  type: "string",
                  title: "SOCE First Name",
                },
                soce_last_name: {
                  type: "string",
                  title: "SOCE Last Name",
                },
                soce_position_title: {
                  type: "string",
                  title: "SOCE Position Title",
                },
                soce_street_address: {
                  type: "string",
                  title: "SOCE Mailing Address",
                },
                soce_municipality: {
                  type: "string",
                  title: "SOCE Municipality",
                },
                soce_province: {
                  type: "string",
                  title: "SOCE Province",
                },
                soce_postal_code: {
                  type: "string",
                  title: "SOCE Postal Code",
                },
                soce_email: {
                  type: "string",
                  title: "SOCE Email Address",
                },
                soce_phone_number: {
                  type: "string",
                  title: "SOCE Phone Number",
                },
              },
            },
          },
        ],
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
    "file",
    "not_senior_officer",
    "Are you an operation representative of the operator?",
    "Proof of authority of operation representative from a SO",
    "so_first_name",
    "so_last_name",
    "so_position_title",
    "so_street_address",
    "so_municipality",
    "so_province",
    "so_postal_code",
    "so_email",
    "so_phone_number",
    "not_operation_representative",
    "Proof of authority of operation representative from a OR",
    "or_first_name",
    "or_last_name",
    "or_position_title",
    "or_street_address",
    "or_municipality",
    "or_province",
    "or_postal_code",
    "or_email",
    "or_phone_number",
    "step_2",
    "legal_name",
    "trade_name",
    "cra_business_number",
    "bc_corporate_registry_number",
    "duns_number",
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
    "bceid",
    "Does the operator have a parent company?",
    "has_parent_company",
    "pc_legal_name",
    "pc_trade_name",
    "pc_cra_business_number",
    "pc_bc_corporate_registry_number",
    "pc_duns_number",
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
    "pc_percentage_owned_by_parent_company",
    "Is operator a compliance entity?",
    "compliance_entity",
    "not_compliance_entity",
    "aso_first_name",
    "aso_last_name",
    "aso_position_title",
    "aso_street_address",
    "aso_municipality",
    "aso_province",
    "aso_postal_code",
    "aso_email",
    "aso_phone_number",
    "Is ASO a senior officer of the compliance entity?",
    "is_not_senior_officer",
    "Proof of authority of ASO from a SOCE",
    "soce_first_name",
    "soce_last_name",
    "soce_position_title",
    "soce_street_address",
    "soce_municipality",
    "soce_province",
    "soce_postal_code",
    "soce_email",
    "soce_phone_number",
  ],
  step_1: {
    "ui:classNames":
      "bg-bc-gov-primary-brand-color-blue text-white no-underline text-start ps-4 rounded",
  },
  role: {
    "ui:widget": "radio",
    "ui:inline": "true",
    "ui:classNames": "flex border rounded p-3",
  },
  not_senior_officer: {
    "ui:classNames":
      "text-bc-gov-primary-brand-color-blue no-underline text-start ps-4 text-xs",
  },
  "Are you an operation representative of the operator?": {
    "ui:widget": "radio",
    "ui:inline": "true",
    "ui:classNames": "flex border rounded p-3",
  },
  not_operation_representative: {
    "ui:classNames":
      "text-bc-gov-primary-brand-color-blue no-underline text-start ps-4 text-xs",
  },
  step_2: {
    "ui:classNames":
      "bg-bc-gov-primary-brand-color-blue text-white no-underline text-start ps-4 rounded",
  },
  "Does the operator have a parent company?": {
    "ui:widget": "radio",
    "ui:inline": "true",
    "ui:classNames": "flex border rounded p-3",
  },
  "Is operator a compliance entity?": {
    "ui:widget": "radio",
    "ui:inline": "true",
    "ui:classNames": "flex border rounded p-3",
  },
  has_parent_company: {
    "ui:classNames":
      "text-bc-gov-primary-brand-color-blue no-underline text-start ps-4 text-xs",
  },
  not_compliance_entity: {
    "ui:classNames":
      "text-bc-gov-primary-brand-color-blue no-underline text-start ps-4 text-xs",
  },
  "Is ASO a senior officer of the compliance entity?": {
    "ui:widget": "radio",
    "ui:inline": "true",
    "ui:classNames": "flex border rounded p-3",
  },
  is_not_senior_officer: {
    "ui:classNames":
      "text-bc-gov-primary-brand-color-blue no-underline text-start ps-4 text-xs",
  },
};
