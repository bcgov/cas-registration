import provinceOptions from "@bciers/data/provinces.json";
import SectionFieldTemplate from "@bciers/components/form/fields/SectionFieldTemplate";
import { RJSFSchema, UiSchema } from "@rjsf/utils";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import { getBusinessStructures } from "@bciers/actions/api";

export const createMultipleOperatorsInformationSchema =
  async (): Promise<RJSFSchema> => {
    const businessStructures = await getBusinessStructures();

    const multipleOperatorsInformationSchema: RJSFSchema = {
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
                  const: false,
                },
              },
            },
            {
              properties: {
                operation_has_multiple_operators: {
                  const: true,
                },
                multiple_operators_array: {
                  type: "array",
                  default: [{ mo_is_extraprovincial_company: false }],
                  items: {
                    type: "object",
                    required: [
                      "mo_legal_name",
                      "mo_trade_name",
                      "mo_business_structure",
                      "mo_cra_business_number",
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
                        anyOf: businessStructures.map(
                          (businessStructure: { name: string }) => ({
                            const: businessStructure.name,
                            title: businessStructure.name,
                          }),
                        ),
                      },
                      mo_cra_business_number: {
                        type: "number",
                        title: "CRA Business Number",
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
                        anyOf: provinceOptions,
                      },
                      mo_postal_code: {
                        type: "string",
                        title: "Postal Code",
                      },
                    },
                    dependencies: {
                      mo_is_extraprovincial_company: {
                        oneOf: [
                          {
                            properties: {
                              mo_is_extraprovincial_company: {
                                const: false,
                              },
                              mo_bc_corporate_registry_number: {
                                type: "string",
                                title: "BC Corporate Registry Number",
                                format: "bc_corporate_registry_number",
                              },
                            },
                            required: ["mo_bc_corporate_registry_number"],
                          },
                          {
                            properties: {
                              mo_is_extraprovincial_company: {
                                const: true,
                              },
                            },
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
    return multipleOperatorsInformationSchema;
  };

export const multipleOperatorsInformationUiSchema: UiSchema = {
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
      removable: true,
    },
    items: {
      "ui:order": [
        "mo_is_extraprovincial_company",
        "mo_legal_name",
        "mo_trade_name",
        "mo_business_structure",
        "mo_bc_corporate_registry_number",
        "mo_cra_business_number",
        "mo_attorney_street_address",
        "mo_municipality",
        "mo_province",
        "mo_postal_code",
      ],
      mo_is_extraprovincial_company: {
        "ui:widget": "ToggleWidget",
      },
      mo_business_structure: {
        "ui:widget": "ComboBox",
        "ui:placeholder": "Select a business structure",
      },
      mo_province: {
        "ui:widget": "ComboBox",
        "ui:placeholder": "Select a province",
      },
      mo_postal_code: {
        "ui:widget": "PostalCodeWidget",
      },
    },
  },
};
