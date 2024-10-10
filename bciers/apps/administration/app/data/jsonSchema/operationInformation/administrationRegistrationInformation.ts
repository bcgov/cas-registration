import SectionFieldTemplate from "@bciers/components/form/fields/SectionFieldTemplate";
import { RJSFSchema, UiSchema } from "@rjsf/utils";
import { getRegulatedProducts } from "@bciers/actions/api";
import { RegistrationPurposes } from "apps/registration/app/components/operations/registration/enums";

export const createAdministrationRegistrationInformationSchema = async (
  registrationPurposesValue: string[],
  optedIn: boolean,
): Promise<RJSFSchema> => {
  // fetch db values that are dropdown options
  const regulatedProducts: { id: number; name: string }[] =
    await getRegulatedProducts();

  const isRegulatedProducts =
    !registrationPurposesValue?.includes(
      RegistrationPurposes.ELECTRICITY_IMPORT_OPERATION,
    ) &&
    !registrationPurposesValue?.includes(
      RegistrationPurposes.POTENTIAL_REPORTING_OPERATION,
    );

  // create the schema with the fetched values
  const registrationInformationSchema: RJSFSchema = {
    title: "Registration Information",
    type: "object",
    required: isRegulatedProducts ? ["regulated_products"] : [],
    properties: {
      registration_purposes: {
        type: "array",
        title: "The purpose of this registration is to register as a:",
        items: {},
      },
      ...(isRegulatedProducts && {
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
      ...(optedIn && {
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
    },
  };
  return registrationInformationSchema;
};

export const registrationInformationUiSchema: UiSchema = {
  "ui:order": ["registration_purpose", "regulated_products"],
  "ui:FieldTemplate": SectionFieldTemplate,
  regulated_products: {
    "ui:widget": "MultiSelectWidget",
    "ui:placeholder": "Select Regulated Product",
  },
};
