import { UUID } from "crypto";
import OperationInformationForm from "apps/registration/app/components/operations/registration/OperationInformationForm";
import { operationInformationSchema } from "apps/registration/app/data/jsonSchema/operationRegistration/operationInformation";
import { RJSFSchema } from "@rjsf/utils";
import {
  getRegulatedProducts,
  getCurrentUsersOperations,
  getRegistrationPurposes,
} from "@bciers/actions/api";

export const createOperationInformationSchema = (
  schema: RJSFSchema,
  purposes: string[],
  regulatedProducts: {
    id: number;
    name: string;
  }[],
  operations: { id: UUID; name: string }[],
) => {
  const localSchema = JSON.parse(JSON.stringify(schema));

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

  localSchema.dependencies.registration_purpose.allOf.map(
    (allOf: { [key: string]: any }) => {
      const regulatedProductsSchema = allOf.then.properties.regulated_products;
      regulatedProductsSchema.items.enum = regulatedProducts.map(
        (product) => product.id,
      );
      regulatedProductsSchema.items.enumNames = regulatedProducts.map(
        (product) => product.name,
      );
    },
  );

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
