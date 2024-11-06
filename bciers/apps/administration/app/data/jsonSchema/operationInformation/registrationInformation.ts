import SectionFieldTemplate from "@bciers/components/form/fields/SectionFieldTemplate";
import { RJSFSchema, UiSchema } from "@rjsf/utils";
import {
  getRegistrationPurposes,
  getRegulatedProducts,
} from "@bciers/actions/api";
import { RegistrationPurposes } from "apps/registration/app/components/operations/registration/enums";

export const createRegistrationInformationSchema =
  async (): Promise<RJSFSchema> => {
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
              required: ["regulated_products"],
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
                      minItems: 1,
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

export const registrationInformationUiSchema: UiSchema = {
  "ui:order": [
    "registration_purpose",
    "regulated_operation",
    "new_entrant_operation",
    "regulated_products",
  ],
  "ui:FieldTemplate": SectionFieldTemplate,
  registration_purpose: {
    "ui:widget": "MultiSelectWidget",
  },
  regulated_products: {
    "ui:widget": "MultiSelectWidget",
    "ui:placeholder": "Select Regulated Product",
  },
};
