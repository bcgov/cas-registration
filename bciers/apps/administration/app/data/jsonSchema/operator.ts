import provinceOptions from "@bciers/data/provinces.json";
import SectionFieldTemplate from "@bciers/components/form/fields/SectionFieldTemplate";
import { RJSFSchema } from "@rjsf/utils";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import ArrayFieldTemplate from "@bciers/components/form/fields/ArrayFieldTemplate";
import { getBusinessStructures } from "@bciers/actions/api";

const createSection1Schema = async () => {
  // business structures
  const businessStructures: { name: string }[] | { error: string } =
    await getBusinessStructures();
  if ("error" in businessStructures) {
    throw new Error("Failed to retrieve business structure information");
  }

  const businessStructureOptions = businessStructures?.map(
    (businessStructure) => ({
      type: "string",
      title: businessStructure.name,
      enum: [businessStructure.name],
      value: businessStructure.name,
    }),
  );

  // add business structure options for partner operators
  const partnerOperatorsArray = {
    type: "array",
    default: [{}],
    items: {
      type: "object",
      required: [
        "partner_legal_name",
        "partner_business_structure",
        "partner_cra_business_number",
        "partner_bc_corporate_registry_number",
      ],
      properties: {
        partner_legal_name: { type: "string", title: "Legal Name" },
        partner_trade_name: { type: "string", title: "Trade Name" },
        partner_business_structure: {
          type: "string",
          title: "Business Structure",
          anyOf: businessStructureOptions,
        },
        partner_cra_business_number: {
          type: "number",
          title: "CRA Business Number",
          minimum: 100000000,
          maximum: 999999999,
        },
        partner_bc_corporate_registry_number: {
          type: "string",
          title: "BC Corporate Registry Number",
          format: "bc_corporate_registry_number",
        },
      },
    },
  };

  // create dependencies for business structure
  const oneOfOptions = [];
  for (const el of businessStructures) {
    const obj = {
      properties: {
        business_structure: {
          const: el.name,
        },
        ...(el.name.includes("Partnership") && {
          partner_operators_array: partnerOperatorsArray,
        }),
      },
    };
    oneOfOptions.push(obj);
  }

  return {
    type: "object",
    title: "Operator Information",
    required: [
      "legal_name",
      "cra_business_number",
      "bc_corporate_registry_number",
      "business_structure",
    ],
    properties: {
      legal_name: { type: "string", title: "Legal Name" },
      trade_name: { type: "string", title: "Trade Name" },
      business_structure: {
        type: "string",
        title: "Business Structure",
        anyOf: businessStructureOptions,
      },
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
    },
    dependencies: {
      business_structure: {
        oneOf: oneOfOptions,
      },
    },
  };
};

const section2: RJSFSchema = {
  type: "object",
  title: "Operator Address",
  required: ["street_address", "municipality", "province", "postal_code"],
  properties: {
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
};

const section3: RJSFSchema = {
  type: "object",
  title: "Parent Company Information",
  required: ["operator_has_parent_operators"],
  properties: {
    operator_has_parent_operators: {
      title: "Does this operator have one or more parent company?",
      type: "boolean",
      default: false,
    },
  },
  dependencies: {
    operator_has_parent_operators: {
      oneOf: [
        {
          required: ["operator_has_parent_operators"],
          properties: {
            operator_has_parent_operators: {
              type: "boolean",
              const: false,
            },
          },
        },
        {
          required: ["operator_has_parent_operators", "parent_operators_array"],
          properties: {
            operator_has_parent_operators: {
              type: "boolean",
              const: true,
            },
            parent_operators_array: {
              default: [{ operator_registered_in_canada: true }],
              type: "array",
              items: {
                type: "object",
                required: [
                  // po = parent operator
                  "po_legal_name",
                  "operator_registered_in_canada",
                ],
                properties: {
                  po_legal_name: {
                    type: "string",
                    title: "Legal Name",
                  },
                  operator_registered_in_canada: {
                    type: "boolean",
                    title: "Is the parent company registered in Canada?",
                    default: true,
                  },
                },
                dependencies: {
                  operator_registered_in_canada: {
                    oneOf: [
                      {
                        properties: {
                          operator_registered_in_canada: { const: true },
                          po_cra_business_number: {
                            type: "number",
                            title: "CRA Business Number",
                            minimum: 100000000,
                            maximum: 999999999,
                          },
                          po_street_address: {
                            type: "string",
                            title: "Business Mailing Address",
                          },
                          po_municipality: {
                            type: "string",
                            title: "Municipality",
                          },
                          po_province: {
                            type: "string",
                            title: "Province",
                            anyOf: provinceOptions,
                          },
                          po_postal_code: {
                            type: "string",
                            title: "Postal Code",
                            format: "postal-code",
                          },
                        },
                        required: [
                          // po = parent operator
                          "po_cra_business_number",
                          "po_street_address",
                          "po_municipality",
                          "po_province",
                          "po_postal_code",
                        ],
                      },
                      {
                        properties: {
                          operator_registered_in_canada: { const: false },
                          foreign_address: {
                            type: "string",
                            title: "Mailing Address",
                          },
                          foreign_tax_id_number: {
                            type: "string",
                            title: "Tax ID Number",
                          },
                        },
                        required: ["foreign_address", "foreign_tax_id_number"],
                      },
                    ],
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

export const createOperatorSchema = async () => {
  return {
    type: "object",
    required: ["section1", "section2", "section3"],
    properties: {
      section1: await createSection1Schema(),
      section2,
      section3,
    },
  } as RJSFSchema;
};

export const operatorUiSchema = {
  "ui:FieldTemplate": SectionFieldTemplate,
  "ui:options": {
    label: false,
  },
  section1: {
    "ui:FieldTemplate": SectionFieldTemplate,
    type: {
      "ui:widget": "ComboBox",
    },
    business_structure: {
      "ui:widget": "ComboBox",
      "ui:placeholder": "Select a business structure",
    },
    partner_operators_array: {
      "ui:FieldTemplate": FieldTemplate,
      "ui:ArrayFieldTemplate": ArrayFieldTemplate,
      "ui:options": {
        label: false,
        arrayAddLabel: "Add another partner company",
        title: "Partner Company Information - Partner Company",
      },
      items: {
        partner_business_structure: {
          "ui:widget": "ComboBox",
          "ui:placeholder": "Select a business structure",
        },
      },
    },
  },
  section2: {
    "ui:FieldTemplate": SectionFieldTemplate,
    province: {
      "ui:widget": "ComboBox",
      "ui:placeholder": "Select a province",
    },
    postal_code: {
      "ui:widget": "PostalCodeWidget",
    },
  },
  section3: {
    "ui:FieldTemplate": SectionFieldTemplate,
    operator_has_parent_operators: {
      "ui:widget": "ToggleWidget",
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
        po_province: {
          "ui:widget": "ComboBox",
          "ui:placeholder": "Select a province",
        },
        po_postal_code: {
          "ui:widget": "PostalCodeWidget",
        },
        operator_registered_in_canada: {
          "ui:widget": "ToggleWidget",
        },
      },
    },
  },
};
