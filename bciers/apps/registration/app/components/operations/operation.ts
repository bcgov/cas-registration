import provinceOptions from "@bciers/data/provinces.json";
import SectionFieldTemplate from "@bciers/components/form/fields/SectionFieldTemplate";
import { RJSFSchema, UiSchema } from "@rjsf/utils";
import ArrayFieldTemplate from "@bciers/components/form/fields/ArrayFieldTemplate";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";

const section1Schema: RJSFSchema = {
  title: "Operation Information",
  type: "object",
  required: ["operation_name", "operation_type"],
  properties: {
    operation_name: { type: "string", title: "Operation Name" },
    operation_type: {
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
      title: "Secondary NAICS Code",
    },
    tertiary_naics_code_id: {
      type: "number",
      title: "Tertiary NAICS Code",
    },
    reporting_activities: {
      type: "array",
      items: {
        type: "string",
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
  //
  // allOf: [
  //   {
  //     if: {
  //       properties: {
  //         operation_has_multiple_operators: {
  //           const: true,
  //         },
  //       },
  //     },
  //     then: {
  //       properties: {
  //         multiple_operators_array: {
  //           type: "array",
  //           default: [{}],
  //           items: {
  //             type: "object",
  //             required: [
  //               "mo_is_extraprovincial_company",
  //               "mo_attorney_street_address",
  //               "mo_municipality",
  //               "mo_province",
  //               "mo_postal_code",
  //             ],
  //             properties: {
  //               mo_is_extraprovincial_company: {
  //                 type: "boolean",
  //                 title:
  //                   "Is the additional operator an extraprovincial company?",
  //                 default: false,
  //               },
  //               mo_legal_name: {
  //                 type: "string",
  //                 title: "Legal Name",
  //               },
  //               mo_attorney_street_address: {
  //                 type: "string",
  //                 title: "Attorney Street Address",
  //               },
  //               mo_municipality: {
  //                 type: "string",
  //                 title: "Municipality",
  //               },
  //               mo_province: {
  //                 type: "string",
  //                 title: "Province",
  //                 enum: provinceOptions,
  //               },
  //               mo_postal_code: {
  //                 type: "string",
  //                 title: "Postal Code",
  //               },
  //             },
  //           },
  //         },
  //       },
  //     },
  //   },
  // ],
};

const section3Schema: RJSFSchema = {
  title: "Registration Information",
  type: "object",
  properties: {
    registration_category: {
      type: "string",
      title: "Registration Category",
    },
    // Display only if registration_category is "Regulated"
    regulated_operation: {
      type: "string",
      title: "Regulated Operation",
    },
    regulated_products: {
      type: "array",
      items: {
        type: "number",
      },
      title: "Regulated Product Names",
    },
    // Display only if regulated_product_names is "New Entrant Operation"
    new_entrant_operation: {
      type: "string",
      title: "New Entrant Operation",
    },
    forcasted_emissions: {
      type: "number",
      title: "Forcasted Emissions",
    },
  },
};

export const operationSchema: RJSFSchema = {
  type: "object",
  properties: {
    section1: section1Schema,
    section2: section2Schema,
    section3: section3Schema,
  },
};

export const operationUiSchema: UiSchema = {
  "ui:FieldTemplate": SectionFieldTemplate,
  "ui: options": {
    label: false,
  },
  section1: {
    "ui:FieldTemplate": SectionFieldTemplate,
    primary_naics_code_id: {
      "ui:widget": "ComboBox",
      "ui:placeholder": "Select Primary NAICS code",
    },
    secondary_naics_code_id: {
      "ui:widget": "ComboBox",
      "ui:placeholder": "Select Secondary NAICS code",
    },
    tertiary_naics_code_id: {
      "ui:widget": "ComboBox",
      "ui:placeholder": "Select Tertiary NAICS code",
    },
    reporting_activities: {
      "ui:widget": "MultiSelectWidget",
      "ui:placeholder": "Select Reporting Activity",
    },
  },
  section2: {
    "ui:FieldTemplate": SectionFieldTemplate,
    operation_has_multiple_operators: {
      "ui:widget": "ToggleWidget",
    },
    multiple_operators_array: {
      "ui:FieldTemplate": FieldTemplate,
      "ui:ArrayFieldTemplate": ArrayFieldTemplate,
      "ui:options": {
        label: false,
        arrayAddLabel: "Add another operator",
        title: "Operator ",
      },
      items: {
        mo_is_extraprovincial_company: {
          "ui:widget": "ToggleWidget",
        },
        mo_province: {
          "ui:widget": "SelectWidget",
        },
        mo_postal_code: {
          "ui:widget": "PostalCodeWidget",
        },
      },
    },
  },
  section3: {
    "ui:FieldTemplate": SectionFieldTemplate,
    regulated_products: {
      "ui:widget": "MultiSelectWidget",
      "ui:placeholder": "Select Regulated Product",
    },
  },
};
