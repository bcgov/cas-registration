import SectionFieldTemplate from "@bciers/components/form/fields/SectionFieldTemplate";
import { TitleOnlyFieldTemplate } from "@bciers/components/form/fields";
import { RJSFSchema, UiSchema } from "@rjsf/utils";
import {
  getRegulatedProducts,
  getContacts,
  getRegistrationPurposes,
  getReportingActivities,
} from "@bciers/actions/api";
import { RegistrationPurposes } from "apps/registration/app/components/operations/registration/enums";

export const createAdministrationRegistrationInformationSchema =
  async (): Promise<RJSFSchema> => {
    // fetch db values that are dropdown options
    const regulatedProducts: { id: number; name: string }[] =
      await getRegulatedProducts();
    if (regulatedProducts && "error" in regulatedProducts)
      throw new Error("Failed to retrieve regulated products information");
    const contacts: {
      items: [{ id: number; first_name: string; last_name: string }];
    } = await getContacts();
    if (contacts && "error" in contacts)
      throw new Error("Failed to retrieve contacts information");
    const registrationPurposes: { id: number; name: string }[] =
      await getRegistrationPurposes();
    if (registrationPurposes && "error" in registrationPurposes)
      throw new Error("Failed to retrieve registration purposes information");
    const reportingActivities: {
      id: number;
      applicable_to: string;
      name: string;
    }[] = await getReportingActivities();
    if (reportingActivities && "error" in reportingActivities)
      throw new Error("Failed to retrieve reporting activities information");

    const reportingActivitiesSchema: RJSFSchema = {
      type: "array",
      minItems: 1,
      items: {
        type: "number",
        enum: reportingActivities.map(
          (activity: { id: number; applicable_to: string; name: string }) =>
            activity.id,
        ),
        // enumNames is a non-standard field required for the MultiSelectWidget
        // @ts-ignore
        enumNames: reportingActivities.map(
          (activity: { applicable_to: string; name: string }) => activity.name,
        ),
      },
      title: "Reporting Activities",
    };

    const regulatedProductsSchema: RJSFSchema = {
      title: "Regulated Product Name(s)",
      type: "array",
      minItems: 1,
      items: {
        enum: regulatedProducts.map((product) => product.id),
        // Ts-ignore until we refactor enumNames https://github.com/bcgov/cas-registration/issues/2176
        // @ts-ignore
        enumNames: regulatedProducts.map((product) => product.name),
      },
    };

    // create the schema with the fetched values
    const registrationInformationSchema: RJSFSchema = {
      title: "Registration Information",
      type: "object",
      required: ["operation_representatives"],
      properties: {
        registration_purpose: {
          type: "string",
          title: "The purpose of this registration is to register as a:",
          enum: registrationPurposes,
        },
        operation_representatives: {
          title: "Operation Representative(s)",
          type: "array",
          minItems: 1,
          items: {
            enum: contacts.items.map((contact) => contact.id),
            // Ts-ignore until we refactor enumNames https://github.com/bcgov/cas-registration/issues/2176
            // @ts-ignore
            enumNames: contacts.items.map(
              (contact) => `${contact.first_name} ${contact.last_name}`,
            ),
          },
        },
      },
      dependencies: {
        registration_purpose: {
          oneOf: [
            {
              properties: {
                registration_purpose: {
                  const: RegistrationPurposes.OBPS_REGULATED_OPERATION,
                },
                regulated_operation_preface: {
                  // Not an actual field, just used to display a message
                  type: "object",
                  readOnly: true,
                },
                regulated_products: {
                  ...regulatedProductsSchema,
                },
                activities: {
                  ...reportingActivitiesSchema,
                },
              },
              required: ["regulated_products", "activities"],
            },
            {
              properties: {
                registration_purpose: {
                  const: RegistrationPurposes.REPORTING_OPERATION,
                },
                reporting_operation_preface: {
                  // Not an actual field, just used to display a message
                  type: "object",
                  readOnly: true,
                },
                activities: {
                  ...reportingActivitiesSchema,
                },
              },
              required: ["activities"],
            },
            {
              properties: {
                registration_purpose: {
                  const: RegistrationPurposes.POTENTIAL_REPORTING_OPERATION,
                },
                potential_reporting_preface: {
                  // Not an actual field, just used to display a message
                  type: "object",
                  readOnly: true,
                },
                activities: {
                  ...reportingActivitiesSchema,
                },
              },
              required: ["activities"],
            },
            {
              properties: {
                registration_purpose: {
                  const: RegistrationPurposes.NEW_ENTRANT_OPERATION,
                },
                new_entrant_preface: {
                  // Not an actual field, just used to display a message
                  type: "object",
                  readOnly: true,
                },
                regulated_products: {
                  ...regulatedProductsSchema,
                },
                activities: {
                  ...reportingActivitiesSchema,
                },
                date_of_first_shipment: {
                  type: "string",
                  title: "When is this operation's date of First Shipment?",
                  enum: [
                    "On or before March 31, 2024",
                    "On or after April 1, 2024",
                  ],
                },
                new_entrant_application: {
                  type: "string",
                  title: "New Entrant Application and Statutory Declaration",
                },
              },
              required: [
                "regulated_products",
                "activities",
                "date_of_first_shipment",
                "new_entrant_application",
              ],
            },
            {
              properties: {
                registration_purpose: {
                  const: RegistrationPurposes.OPTED_IN_OPERATION,
                },
                regulated_products: {
                  ...regulatedProductsSchema,
                },
                activities: {
                  ...reportingActivitiesSchema,
                },
                opted_in_preface: {
                  // Not an actual field, just used to display a message
                  type: "object",
                  readOnly: true,
                },
                opted_in_operation: {
                  type: "object",
                  properties: {
                    meets_section_3_emissions_requirements: {
                      type: "boolean",
                    },
                    meets_electricity_import_operation_criteria: {
                      type: "boolean",
                    },
                    meets_entire_operation_requirements: {
                      type: "boolean",
                    },
                    meets_section_6_emissions_requirements: {
                      type: "boolean",
                    },
                    meets_naics_code_11_22_562_classification_requirements: {
                      type: "boolean",
                    },
                    meets_producing_gger_schedule_a1_regulated_product: {
                      type: "boolean",
                    },
                    meets_reporting_and_regulated_obligations: {
                      type: "boolean",
                    },
                    meets_notification_to_director_on_criteria_change: {
                      type: "boolean",
                    },
                  },
                  required: [
                    "meets_section_3_emissions_requirements",
                    "meets_electricity_import_operation_criteria",
                    "meets_entire_operation_requirements",
                    "meets_section_6_emissions_requirements",
                    "meets_naics_code_11_22_562_classification_requirements",
                    "meets_producing_gger_schedule_a1_regulated_product",
                    "meets_reporting_and_regulated_obligations",
                    "meets_notification_to_director_on_criteria_change",
                  ],
                },
              },
              required: [
                "regulated_products",
                "activities",
                "opted_in_operation",
              ],
            },
            {
              properties: {
                registration_purpose: {
                  const: RegistrationPurposes.ELECTRICITY_IMPORT_OPERATION,
                },
                // no fields for EIOs
              },
            },
          ],
        },
      },
    };
    return registrationInformationSchema;
  };

export const registrationInformationUiSchema: UiSchema = {
  "ui:order": [
    "registration_purpose",
    "regulated_operation_preface",
    "regulated_products",
    "reporting_activities",
    "new_entrant_preface",
    "date_of_first_shipment",
    "new_entrant_application",
  ],
  "ui:FieldTemplate": SectionFieldTemplate,
  registration_purpose: {
    "ui:widget": "SelectWidget",
  },
  operation_representatives: {
    "ui:widget": "MultiSelectWidget",
  },
  regulated_operation_preface: {
    "ui:classNames": "text-bc-bg-blue text-lg",
    "ui:FieldTemplate": TitleOnlyFieldTemplate,
    "ui:title": "Regulated Operation",
  },
  activities: {
    "ui:widget": "MultiSelectWidget",
    "ui:placeholder": "Select Reporting Activity",
  },
  regulated_products: {
    "ui:widget": "MultiSelectWidget",
    "ui:placeholder": "Select Regulated Product",
  },
  opted_in_preface: {
    "ui:classNames": "text-bc-bg-blue text-lg",
    "ui:FieldTemplate": TitleOnlyFieldTemplate,
    "ui:title": "Opted-In Operation",
  },
  new_entrant_preface: {
    "ui:classNames": "text-bc-bg-blue text-lg",
    "ui:FieldTemplate": TitleOnlyFieldTemplate,
    "ui:title": "New Entrant Operation",
  },
  reporting_operation_preface: {
    "ui:classNames": "text-bc-bg-blue text-lg",
    "ui:FieldTemplate": TitleOnlyFieldTemplate,
    "ui:title": "Reporting Operation",
  },
  potential_reporting_preface: {
    "ui:classNames": "text-bc-bg-blue text-lg",
    "ui:FieldTemplate": TitleOnlyFieldTemplate,
    "ui:title": "Potential Reporting Operation",
  },
  date_of_first_shipment: {
    "ui:widget": "RadioWidget",
  },
  new_entrant_application: {
    "ui:widget": "FileWidget",
    "ui:options": {
      filePreview: true,
      accept: ".pdf",
    },
  },
};
