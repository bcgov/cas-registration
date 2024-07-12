import provinceOptions from "@bciers/data/provinces.json";
import SectionFieldTemplate from "@bciers/components/form/fields/SectionFieldTemplate";
import { RJSFSchema, UiSchema } from "@rjsf/utils";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";

const section1Schema: RJSFSchema = {
  title: "Operation Information",
  type: "object",
  required: ["name", "type", "naics_code_id"],
  properties: {
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
    process_flow_diagram: {
      type: "string",
      title: "Process Flow Diagram",
    },
    boundary_map: {
      type: "string",
      title: "Boundary Map",
    },
    equipment_list: {
      type: "string",
      title: "Equipment List",
    },
    operation_representative: {
      type: "string",
      title: "Operation Representative",
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
  dependencies: {
    operation_has_multiple_operators: {
      oneOf: [
        {
          properties: {
            operation_has_multiple_operators: {
              enum: [false],
            },
          },
        },
        {
          properties: {
            operation_has_multiple_operators: {
              enum: [true],
            },
            multiple_operators_array: {
              type: "array",
              default: [{}],
              items: {
                type: "object",
                required: [
                  "mo_legal_name",
                  "mo_trade_name",
                  "mo_business_structure",
                  "mo_cra_business_number",
                  "mo_bc_corporate_registry_number",
                  "mo_attorney_street_address",
                  "mo_municipality",
                  "mo_province",
                  "mo_postal_code",
                ],
                properties: {
                  mo_is_extraprovincial_company: {
                    type: "boolean",
                    title:
                      "Is the additional operator an extraprovincial company?",
                    default: false,
                  },
                  mo_legal_name: {
                    type: "string",
                    title: "Legal Name",
                  },
                  mo_trade_name: {
                    type: "string",
                    title: "Trade Name",
                  },
                  mo_business_structure: {
                    type: "string",
                    title: "Business Structure",
                  },
                  mo_cra_business_number: {
                    type: "string",
                    title: "CRA Business Number",
                  },
                  mo_bc_corporate_registry_number: {
                    type: "string",
                    title: "BC Corporate Registry Number",
                    format: "bc_corporate_registry_number",
                  },
                  mo_attorney_street_address: {
                    type: "string",
                    title: "Attorney Street Address",
                  },
                  mo_municipality: {
                    type: "string",
                    title: "Municipality",
                  },
                  mo_province: {
                    type: "string",
                    title: "Province",
                    enum: provinceOptions,
                  },
                  mo_postal_code: {
                    type: "string",
                    title: "Postal Code",
                  },
                },
              },
            },
          },
        },
      ],
    },
  },
};

const section3Schema: RJSFSchema = {
  title: "Registration Information",
  type: "object",
  properties: {
    registration_category: {
      type: "string",
      title: "Registration Category",
      enum: ["Regulated", "Non-Regulated", "New Entrant Operation"],
    },
    regulated_products: {
      type: "array",
      items: {
        type: "number",
      },
      title: "Regulated Product Names",
    },
    forcasted_emissions: {
      type: "number",
      title: "Forcasted Emissions",
    },
  },
  dependencies: {
    registration_category: {
      allOf: [
        {
          if: {
            properties: {
              registration_category: {
                const: "Regulated",
              },
            },
          },
          then: {
            properties: {
              regulated_operation: {
                type: "string",
                title: "Regulated Operation",
              },
            },
          },
        },
        {
          if: {
            properties: {
              registration_category: {
                const: "New Entrant Operation",
              },
            },
          },
          then: {
            properties: {
              new_entrant_operation: {
                type: "string",
                title: "New Entrant Operation",
              },
            },
          },
        },
      ],
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
    naics_code_id: {
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
    process_flow_diagram: {
      "ui:widget": "FileWidget",
    },
    boundary_map: {
      "ui:widget": "FileWidget",
    },
    equipment_list: {
      "ui:widget": "FileWidget",
    },
  },
  section2: {
    "ui:FieldTemplate": SectionFieldTemplate,
    operation_has_multiple_operators: {
      "ui:widget": "ToggleWidget",
    },
    multiple_operators_array: {
      "ui:FieldTemplate": FieldTemplate,
      "ui:options": {
        label: false,
        arrayAddLabel: "Add operator",
        title: "Operator ",
      },
      items: {
        mo_is_extraprovincial_company: {
          "ui:widget": "ToggleWidget",
        },
        mo_business_structure: {
          "ui:widget": "ComboBox",
          "ui:placeholder": "Select a business structure",
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
    "ui:order": [
      "registration_category",
      "regulated_operation",
      "new_entrant_operation",
      "regulated_products",
      "forcasted_emissions",
    ],
    "ui:FieldTemplate": SectionFieldTemplate,
    regulated_products: {
      "ui:widget": "MultiSelectWidget",
      "ui:placeholder": "Select Regulated Product",
    },
  },
};
