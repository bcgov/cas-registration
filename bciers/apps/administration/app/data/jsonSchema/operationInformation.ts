import provinceOptions from "@bciers/data/provinces.json";
import SectionFieldTemplate from "@bciers/components/form/fields/SectionFieldTemplate";
import { RJSFSchema, UiSchema } from "@rjsf/utils";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import {
  getBusinessStructures,
  getNaicsCodes,
  getRegistrationPurposes,
  getRegulatedProducts,
  getReportingActivities,
} from "@bciers/actions/api";
import { RegistrationPurposes } from "@/registration/app/components/operations/registration/enums";

export const createOperationInformationSchema =
  async (): Promise<RJSFSchema> => {
    const naicsCodes = await getNaicsCodes();
    const reportingActivities = await getReportingActivities();
    console.log("reportingActivities", reportingActivities);

    const operationInformationSchema: RJSFSchema = {
      title: "Operation Information",
      type: "object",
      required: [
        "name",
        "type",
        "naics_code_id",
        // multiselect mandatory not currently supported brianna
        "activities",
        "boundary_map",
        "process_flow_diagram",
      ],
      properties: {
        name: { type: "string", title: "Operation Name" },
        type: {
          type: "string",
          title: "Operation Type",
          enum: ["Single Facility Operation", "Linear Facility Operation"],
        },
        naics_code_id: {
          type: "number",
          title: "Primary NAICS Code",
          anyOf: naicsCodes.map(
            (code: {
              id: number;
              naics_code: string;
              naics_description: string;
            }) => ({
              const: code?.id,
              title: `${code?.naics_code} - ${code?.naics_description}`,
            }),
          ),
        },
        secondary_naics_code_id: {
          type: "number",
          title: "Secondary NAICS Code",
          anyOf: naicsCodes.map(
            (code: {
              id: number;
              naics_code: string;
              naics_description: string;
            }) => ({
              const: code?.id,
              title: `${code?.naics_code} - ${code?.naics_description}`,
            }),
          ),
        },
        tertiary_naics_code_id: {
          type: "number",
          title: "Tertiary NAICS Code",
          anyOf: naicsCodes.map(
            (code: {
              id: number;
              naics_code: string;
              naics_description: string;
            }) => ({
              const: code?.id,
              title: `${code?.naics_code} - ${code?.naics_description}`,
            }),
          ),
        },

        activities: {
          type: "array",
          items: {
            type: "number",
            enum: reportingActivities.map(
              (activity: {
                // Do we need to display all of these or just some based on type?
                id: number;
                applicable_to: string;
                name: string;
              }) => activity.id,
            ),
            enumNames: reportingActivities.map(
              (activity: {
                // Do we need to display all of these or just some based on type?
                applicable_to: string;
                name: string;
              }) => activity.name,
            ),
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
      },
    };
    return operationInformationSchema;
  };

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
                      // brianna
                      // "mo_bc_corporate_registry_number",
                      "mo_attorney_street_address",
                      "mo_municipality",
                      "mo_province",
                      "mo_postal_code",
                    ],
                    properties: {
                      // brianna this is conditional
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
                        anyOf: provinceOptions,
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
    return multipleOperatorsInformationSchema;
  };

const createRegistrationInformationSchema = async (): Promise<RJSFSchema> => {
  // fetch db values that are dropdown options
  const regulatedProducts: { id: number; name: string }[] =
    await getRegulatedProducts();
  const registrationPurposes = await getRegistrationPurposes();

  // create the schema with the fetched values
  const registrationInformationSchema: RJSFSchema = {
    title: "Registration Information",
    type: "object",
    required: ["registration_purpose", "operation"],
    properties: {
      registration_purpose: {
        type: "string",
        title: "The purpose of this registration is to register as a:",
        anyOf: registrationPurposes.map((purpose: string) => ({
          const: purpose,
          title: purpose,
        })),
      },
    },

    dependencies: {
      registration_purpose: {
        oneOf: registrationPurposes.map((purpose: string) => {
          return {
            // required: ["regulated_products"],
            properties: {
              registration_purpose: {
                type: "string",
                const: purpose,
              },
              ...(purpose !==
                RegistrationPurposes.ELECTRICITY_IMPORT_OPERATION &&
                purpose !==
                  RegistrationPurposes.POTENTIAL_REPORTING_OPERATION && {
                  regulated_products: {
                    title: "Regulated Product Name(s)",
                    type: "array",
                    // minItems: 1,
                    items: {
                      enum: regulatedProducts.map((product) => product.id),
                      enumNames: regulatedProducts.map(
                        (product) => product.name,
                      ),
                    },
                  },
                }),
            },
          };
        }),
      },
    },
  };
  return registrationInformationSchema;
};
export const createAdministrationOperationInformationSchema =
  async (): Promise<RJSFSchema> => {
    const administrationOperationInformationSchema: RJSFSchema = {
      type: "object",
      properties: {
        section1: await createOperationInformationSchema(),
        section2: await createMultipleOperatorsInformationSchema(),
        section3: await createRegistrationInformationSchema(),
      },
    };
    return administrationOperationInformationSchema;
  };

export const operationInformationUISchema: UiSchema = {
  "ui:FieldTemplate": SectionFieldTemplate,
  type: {
    "ui:widget": "SelectWidget",
    "ui:placeholder": "Select Operation Type",
  },
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
  activities: {
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
        "ui:widget": "ComboBox",
        "ui:placeholder": "Select a province",
      },
      mo_postal_code: {
        "ui:widget": "PostalCodeWidget",
      },
    },
  },
};

export const registrationInformationUiSchema: UiSchema = {
  "ui:order": [
    "registration_purpose",
    "regulated_operation",
    "new_entrant_operation",
    "regulated_products",
  ],
  "ui:FieldTemplate": SectionFieldTemplate,
  regulated_products: {
    "ui:widget": "MultiSelectWidget",
    "ui:placeholder": "Select Regulated Product",
  },
};
export const administrationOperationInformationUiSchema: UiSchema = {
  "ui:FieldTemplate": SectionFieldTemplate,
  "ui: options": {
    label: false,
  },
  section1: operationInformationUISchema,
  section2: multipleOperatorsInformationUiSchema,
  section3: registrationInformationUiSchema,
};
