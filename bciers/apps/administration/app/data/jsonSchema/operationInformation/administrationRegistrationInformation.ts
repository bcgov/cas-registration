import SectionFieldTemplate from "@bciers/components/form/fields/SectionFieldTemplate";
import { RJSFSchema, UiSchema } from "@rjsf/utils";
import { getRegulatedProducts } from "@bciers/actions/api";
import { RegistrationPurposes } from "apps/registration/app/components/operations/registration/enums";

export const createAdministrationRegistrationInformationSchema = async (
  registrationPurposesValue: string[],
): Promise<RJSFSchema> => {
  // fetch db values that are dropdown options
  const regulatedProducts: { id: number; name: string }[] =
    await getRegulatedProducts();

  const isRegulatedProducts =
    !registrationPurposesValue.includes(
      RegistrationPurposes.ELECTRICITY_IMPORT_OPERATION,
    ) &&
    !registrationPurposesValue.includes(
      RegistrationPurposes.POTENTIAL_REPORTING_OPERATION,
    );

  const regulatedProductsSchema = {
    regulated_products: {
      title: "Regulated Product Name(s)",
      type: "array",
      minItems: 1,
      items: {
        enum: regulatedProducts.map((product) => product.id),
        enumNames: regulatedProducts.map((product) => product.name),
      },
    },
  };

  // create the schema with the fetched values
  const registrationInformationSchema: RJSFSchema = {
    title: "Registration Information",
    type: "object",
    required: ["registration_purpose"],
    properties: {
      registration_purpose: {
        type: "array",
        title: "The purpose of this registration is to register as a:",
        items: {},
      },
      ...(isRegulatedProducts && regulatedProductsSchema),
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
