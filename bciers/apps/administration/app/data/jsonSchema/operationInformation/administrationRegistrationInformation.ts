import SectionFieldTemplate from "@bciers/components/form/fields/SectionFieldTemplate";
import { TitleOnlyFieldTemplate } from "@bciers/components/form/fields";
import { RJSFSchema, UiSchema } from "@rjsf/utils";
import { getRegulatedProducts, getContacts } from "@bciers/actions/api";
import { RegistrationPurposes } from "apps/registration/app/components/operations/registration/enums";

export const createAdministrationRegistrationInformationSchema = async (
  registrationPurposeValue: string,
): Promise<RJSFSchema> => {
  // fetch db values that are dropdown options
  const regulatedProducts: { id: number; name: string }[] =
    await getRegulatedProducts();
  const contacts: {
    items: [{ id: number; first_name: string; last_name: string }];
  } = await getContacts();
  const isRegulatedProducts =
    registrationPurposeValue ===
    RegistrationPurposes.OBPS_REGULATED_OPERATION.valueOf();
  const isNewEntrant =
    registrationPurposeValue === RegistrationPurposes.NEW_ENTRANT_OPERATION;
  const isOptIn =
    registrationPurposeValue === RegistrationPurposes.OPTED_IN_OPERATION;

  // create the schema with the fetched values
  const registrationInformationSchema: RJSFSchema = {
    title: "Registration Information",
    type: "object",
    required: [
      "operation_representatives",
      ...(isRegulatedProducts ? ["regulated_products"] : []),
    ],
    properties: {
      registration_purpose: {
        type: "string",
        title: "The purpose of this registration is to register as a:",
      },
      ...(isRegulatedProducts && {
        regulated_operation_preface: {
          // Not an actual field, just used to display a message
          type: "object",
          readOnly: true,
        },
        regulated_products: {
          title: "Regulated Product Name(s)",
          type: "array",
          minItems: 1,
          items: {
            enum: regulatedProducts.map((product) => product.id),
            // Ts-ignore until we refactor enumNames https://github.com/bcgov/cas-registration/issues/2176
            // @ts-ignore
            enumNames: regulatedProducts.map((product) => product.name),
          },
        },
      }),
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
      ...(isOptIn && {
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
        },
      }),
      ...(isNewEntrant && {
        new_entrant_preface: {
          // Not an actual field, just used to display a message
          type: "object",
          readOnly: true,
        },
        date_of_first_shipment: {
          type: "string",
          title: "When is this operation's date of First Shipment?",
          enum: ["On or before March 31, 2024", "On or after April 1, 2024"],
        },
        new_entrant_application: {
          type: "string",
          title: "New Entrant Application and Statutory Declaration",
        },
      }),
    },
  };
  return registrationInformationSchema;
};

export const registrationInformationUiSchema: UiSchema = {
  "ui:order": [
    "registration_purpose",
    "regulated_operation_preface",
    "regulated_products",
    "new_entrant_preface",
    "date_of_first_shipment",
    "new_entrant_application",
  ],
  "ui:FieldTemplate": SectionFieldTemplate,
  operation_representatives: {
    "ui:widget": "MultiSelectWidget",
  },
  regulated_operation_preface: {
    "ui:classNames": "text-bc-bg-blue text-lg",
    "ui:FieldTemplate": TitleOnlyFieldTemplate,
    "ui:title": "Regulated Operation",
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
