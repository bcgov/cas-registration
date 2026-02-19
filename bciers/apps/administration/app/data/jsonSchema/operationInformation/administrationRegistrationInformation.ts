import SectionFieldTemplate from "@bciers/components/form/fields/SectionFieldTemplate";
import { TitleOnlyFieldTemplate } from "@bciers/components/form/fields";
import { RJSFSchema, UiSchema } from "@rjsf/utils";
import {
  getRegulatedProducts,
  getContacts,
  getRegistrationPurposes,
  getReportingActivities,
  getReportingYears,
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
      regulated_name: string;
    }[] = await getReportingActivities();
    if (reportingActivities && "error" in reportingActivities)
      throw new Error("Failed to retrieve reporting activities information");
    // fetch valid reporting years for OptedOutOperation dropdown
    const validReportingYears: { reporting_year: number }[] =
      // NOTE: getReportingYears() includes optional query param exclude_past.
      // Not using it immediately due to timing of opt-out feature rollout relative to reporting year,
      // but will be able to make use of this feature in the future to simplify the dropdown list
      await getReportingYears();
    if (validReportingYears && "error" in validReportingYears)
      throw new Error("Failed to retrieve reporting years");

    const reportingYearsDropdownOptions = validReportingYears.map((year) => ({
      const: year.reporting_year,
      title: `${String(year.reporting_year)} reporting year`,
    }));

    const reportingActivitiesSchema: RJSFSchema = {
      type: "array",
      minItems: 1,
      items: {
        type: "number",
        enum: reportingActivities.map(
          (activity: { id: number; applicable_to: string; name: string }) =>
            activity.id,
        ),
        // @ts-expect-error - enumNames is a non-standard field required for the MultiSelectWidget
        enumNames: reportingActivities.map(
          (activity: { applicable_to: string; name: string }) => activity.name,
        ),
        enumTooltips: reportingActivities.map(
          (activity: {
            applicable_to: string;
            name: string;
            regulated_name: string;
          }) =>
            activity.name != activity.regulated_name
              ? activity.regulated_name
              : "",
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
        // @ts-expect-error - Ts-ignore until we refactor enumNames https://github.com/bcgov/cas-registration/issues/2176
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
            // @ts-expect-error - Ts-ignore until we refactor enumNames https://github.com/bcgov/cas-registration/issues/2176
            enumNames: contacts.items.map(
              (contact) => `${contact.first_name} ${contact.last_name}`,
            ),
          },
        },
      },
      dependencies: {
        registration_purpose: {
          oneOf: [
            // OBPS REGULATED OPERATION
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
            // REPORTING OPERATION
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
            // POTENTIAL REPORTING OPERATION
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
            // NEW ENTRANT
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
                new_entrant_application: {
                  type: "string",
                  title: "New Entrant Application and Statutory Declaration",
                },
              },
              required: [
                "regulated_products",
                "activities",
                "new_entrant_application",
              ],
            },
            // OPTED-IN & OPTED-OUT
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
                opted_out_operation: {
                  title: "Year that final report is expected",
                  type: ["number", "null"],
                  anyOf: reportingYearsDropdownOptions,
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
            // ELECTRICITY IMPORT OPERATION (EIO)
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
    // fields for opted-in (or opted-out) operations only
    "opted_out_operation",
    "opted_in_preface",
    "opted_in_operation",
    // fields for New Entrant operations only
    "new_entrant_preface",
    "new_entrant_application",
  ],
  "ui:FieldTemplate": SectionFieldTemplate,
  registration_purpose: {
    "ui:widget": "SelectWidget",
  },
  operation_representatives: {
    "ui:widget": "MultiSelectWidgetWithTooltip",
  },
  regulated_operation_preface: {
    "ui:classNames": "text-bc-bg-blue text-lg",
    "ui:FieldTemplate": TitleOnlyFieldTemplate,
    "ui:title": "Regulated Operation",
  },
  activities: {
    "ui:widget": "MultiSelectWidgetWithTooltip",
    "ui:placeholder": "Select Reporting Activity",
    "ui:tooltipPrefix": "Regulatory name: ",
  },
  regulated_products: {
    "ui:widget": "MultiSelectWidgetWithTooltip",
    "ui:placeholder": "Select Regulated Product",
  },
  opted_out_operation: {
    "ui:widget": "OptedOutOperationWidget",
    "ui:options": {
      label: false,
    },
  },
  opted_in_preface: {
    "ui:classNames": "text-bc-bg-blue text-lg",
    "ui:FieldTemplate": TitleOnlyFieldTemplate,
    "ui:title": "Opted-In Operation",
  },
  opted_in_operation: {
    "ui:FieldTemplate": SectionFieldTemplate,
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
  new_entrant_application: {
    "ui:widget": "FileWidget",
    "ui:options": {
      filePreview: true,
      accept: ".pdf",
    },
  },
};
