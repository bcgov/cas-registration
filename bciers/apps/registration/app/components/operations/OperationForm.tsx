"use client";

import SingleStepTaskListForm from "@bciers/components/form/SingleStepTaskListForm";
import provinceOptions from "@/app/data/provinces.json";
import SectionFieldTemplate from "@bciers/components/form/fields/SectionFieldTemplate";
import { RJSFSchema, UiSchema } from "@rjsf/utils";
import ArrayFieldTemplate from "@bciers/components/form/fields/ArrayFieldTemplate";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import TitleOnlyFieldTemplate from "@bciers/components/form/fields/TitleOnlyFieldTemplate";

const subheading = {
  "ui:classNames": "text-bc-bg-blue text-start text-lg",
  "ui:FieldTemplate": TitleOnlyFieldTemplate,
};

const section1Schema: RJSFSchema = {
  title: "Operation Information",
  type: "object",
  properties: {
    name: { type: "string", title: "Operation Name" },
    type: {
      type: "string",
      title: "Operation Type",
      enum: ["Single Facility Operation", "Linear Facilities Operation"],
    },
    primary_naics_code_id: {
      type: "number",
      title: "Primary NAICS Code",
    },
    secondary_naics_code_id: {
      type: "number",
      title: "Primary NAICS Code",
    },
    tertiary_naics_code_id: {
      type: "number",
      title: "Primary NAICS Code",
    },
    reporting_activities: {
      type: "array",
      items: {
        type: "number",
      },
      title: "Reporting Activities",
    },
  },
};

const section2Schema: RJSFSchema = {
  title: "Multiple Operators Information",
  type: "object",
  properties: {
    operation_has_multiple_operators: {
      type: "boolean",
      title: "Does the operation have multiple operators?",
      default: false,
    },
  },
  allOf: [
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
                "mo_business_structure",
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
                  type: "string",
                  title: "BC Corporate Registry Number",
                  format: "bc_corporate_registry_number",
                },
                mo_business_structure: {
                  type: "string",
                  title: "Business Structure",
                },
                mo_website: {
                  type: "string",
                  title: "Website (optional)",
                  format: "uri",
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
                  format: "postal-code",
                },
                mo_mailing_address_section: {
                  //Not an actual field in the db - this is just to make the form look like the wireframes
                  title:
                    "Please provide information about the business mailing address of this operator:",
                  type: "object",
                  readOnly: true,
                },
                mo_mailing_address_same_as_physical: {
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
                        title: "Business Mailing Address",
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
  ],
};

const section3Schema: RJSFSchema = {
  title: "Registration Information",
  type: "object",
  properties: {
    email: {
      type: "string",
      title: "Email",
    },
  },
};

const schema: RJSFSchema = {
  type: "object",
  properties: {
    section1: section1Schema,
    section2: section2Schema,
    section3: section3Schema,
  },
};

const uiSchema: UiSchema = {
  "ui:FieldTemplate": SectionFieldTemplate,
  "ui: options": {
    label: false,
  },
  section1: {
    "ui:FieldTemplate": SectionFieldTemplate,
  },
  section2: {
    "ui:FieldTemplate": SectionFieldTemplate,
    multiple_operators_section: {
      ...subheading,
    },
    multiple_operators_array: {
      "ui:FieldTemplate": FieldTemplate,
      "ui:ArrayFieldTemplate": ArrayFieldTemplate,
      "ui:options": {
        label: false,
        arrayAddLabel: "Add another operator",
        title: "Multiple Operator(s) information - Operator",
      },
      items: {
        mo_physical_address_section: {
          ...subheading,
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
          "ui:placeholder": "Select a business structure",
        },
        mo_physical_province: {
          "ui:widget": "ComboBox",
        },
        mo_mailing_province: {
          "ui:widget": "ComboBox",
        },
        mo_mailing_address_section: {
          ...subheading,
        },
        mo_physical_postal_code: {
          "ui:widget": "PostalCodeWidget",
        },
        mo_mailing_postal_code: {
          "ui:widget": "PostalCodeWidget",
        },
      },
    },
  },
  section3: {
    "ui:FieldTemplate": SectionFieldTemplate,
  },
};

const OperationForm = () => {
  return (
    <SingleStepTaskListForm
      schema={schema}
      uiSchema={uiSchema}
      formData={{}}
      onSubmit={(e) => console.log(e)}
      onCancel={() => console.log("cancel")}
    />
  );
};

export default OperationForm;
