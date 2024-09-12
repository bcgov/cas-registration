import { UUID } from "crypto";
import OperationInformationForm from "apps/registration/app/components/operations/registration/OperationInformationForm";
import { operationInformationSchema } from "apps/registration/app/data/jsonSchema/operationRegistration/operationInformation";
import { RJSFSchema } from "@rjsf/utils";
import {
  getRegulatedProducts,
  getCurrentUsersOperations,
  getRegistrationPurposes,
} from "@bciers/actions/api";
import safeJsonParse from "libs/utils/safeJsonParse";
import { RegistrationPurposes } from "./enums";

export const createOperationInformationSchema = (
  schema: RJSFSchema,
  purposes: string[],
  regulatedProducts: {
    id: number;
    name: string;
  }[],
  operations: { id: UUID; name: string }[],
) => {
  const localSchema = safeJsonParse(JSON.stringify(schema));

  // add purposes from db to schema
  localSchema.properties.registration_purpose.anyOf = purposes.map(
    (purpose) => ({
      const: purpose,
      title: purpose,
    }),
  );

  // add operations from db to schema
  localSchema.properties.operation.anyOf = operations.map((operation) => ({
    const: operation.id,
    title: operation.name,
  }));

  // add regulated products
  const regulatedProductsEnum = regulatedProducts.map((product) => product.id);
  const regulatedProductsEnumNames = regulatedProducts.map(
    (product) => product.name,
  );

  const oneOfOptions = purposes.map((purpose) => {
    const isRegulatedProducts =
      purpose !== RegistrationPurposes.ELECTRICITY_IMPORT_OPERATION &&
      purpose !== RegistrationPurposes.POTENTIAL_REPORTING_OPERATION;

    return {
      required: [isRegulatedProducts && "regulated_products"],
      properties: {
        registration_purpose: {
          type: "string",
          const: purpose,
        },
        ...(isRegulatedProducts && {
          regulated_products: {
            title: "Regulated Product Name(s)",
            type: "array",
            minItems: 1,
            items: {
              enum: regulatedProductsEnum,
              enumNames: regulatedProductsEnumNames,
            },
          },
        }),
      },
    };
  });

  localSchema.dependencies.registration_purpose.oneOf = oneOfOptions;
  return localSchema;
};

const OperationInformationPage = async ({
  step,
  steps,
}: {
  step: number;
  steps: string[];
}) => {
  const regulatedProducts: { id: number; name: string }[] =
    await getRegulatedProducts();
  const operations = await getCurrentUsersOperations();
  const registrationPurposes = await getRegistrationPurposes();

  const formSchema = createOperationInformationSchema(
    operationInformationSchema,
    registrationPurposes,
    regulatedProducts,
    operations,
  );

  return (
    <OperationInformationForm
      formData={{}}
      schema={formSchema}
      step={step}
      steps={steps}
    />
  );
};

export default OperationInformationPage;
