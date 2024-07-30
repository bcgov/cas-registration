import { UUID } from "crypto";
import { validate as isValidUUID } from "uuid";
import RegistrationPurposeForm from "apps/registration/app/components/operations/registration/RegistrationPurposeForm";
import { registrationPurposeSchema } from "apps/registration/app/data/jsonSchema/operationRegistration/registrationPurpose";
import { getRegulatedProducts } from "@bciers/actions/api";
import { RJSFSchema } from "@rjsf/utils";

// 🛠️ Function to create an operation schema with updated enum values
export const createRegistrationPurposeSchema = (
  schema: RJSFSchema,
  regulatedProducts: {
    id: number;
    name: string;
  }[],
) => {
  const localSchema = JSON.parse(JSON.stringify(schema));

  const regulatedProductsSchema =
    localSchema.dependencies.registration_purpose.allOf[0].then.properties
      .regulated_products;

  // regulated products
  if (Array.isArray(regulatedProducts)) {
    regulatedProductsSchema.items.enum = regulatedProducts.map(
      (product) => product.id,
    );
    regulatedProductsSchema.items.enumNames = regulatedProducts.map(
      (product) => product.name,
    );
  }
  return localSchema;
};

const RegistrationPurposePage = async ({
  operation,
  step,
  steps,
}: {
  operation: UUID | "create";
  step: number;
  steps: string[];
}) => {
  // Don't fetch operation if UUID is invalid or operation === "create"
  if (operation && isValidUUID(operation)) {
    // Fetch formData data here
  }

  const regulatedProducts: { id: number; name: string }[] =
    await getRegulatedProducts();

  const formSchema = createRegistrationPurposeSchema(
    registrationPurposeSchema,
    regulatedProducts,
  );

  return (
    <RegistrationPurposeForm
      formData={{}}
      operation={operation}
      schema={formSchema}
      step={step}
      steps={steps}
    />
  );
};

export default RegistrationPurposePage;
