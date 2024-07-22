import { UUID } from "crypto";
import { validate as isValidUUID } from "uuid";
import OperationRegistrationForm from "./OperationRegistrationForm";
import {
  operationRegistrationSchema,
  operationRegistrationNewEntrantSchema,
} from "apps/registration/app/data/jsonSchema/operationRegistration";
import fetchFacilitiesPageData from "@/administration/app/components/facilities/fetchFacilitiesPageData";
import {
  FacilityInitialData,
  FacilitiesSearchParams,
} from "@/administration/app/components/facilities/types";
import { getRegulatedProducts } from "@bciers/actions/api";
import { RJSFSchema } from "@rjsf/utils";

// 🛠️ Function to create an operation schema with updated enum values
export const createOperationRegistrationSchema = (
  schema: RJSFSchema,
  regulatedProducts: {
    id: number;
    name: string;
  }[],
) => {
  const localSchema = JSON.parse(JSON.stringify(schema));
  const registrationPurposeDependencies =
    localSchema.properties.registrationPurpose.dependencies;
  const regulatedProductsSchema =
    registrationPurposeDependencies.registration_purpose.allOf[0].then
      .properties.regulated_products;

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

const OperationRegistrationPage = async ({
  formSection,
  operation,
  searchParams,
}: {
  formSection: number;
  operation: UUID | "create";
  searchParams: FacilitiesSearchParams;
}) => {
  const isFacilityPage = formSection === 3 && operation;
  const isRegistrationPurposePage = formSection === 1;

  // This will need to be pulled from the database after page 1 is implemented
  const isNewEntrantOperation = true;
  // New entrant operations have an additional page
  const registrationSchema = isNewEntrantOperation
    ? operationRegistrationNewEntrantSchema
    : operationRegistrationSchema;

  let facilityInitialData: FacilityInitialData | undefined;
  let regulatedProducts: { id: number; name: string }[] = [];
  if (operation && isValidUUID(operation)) {
    // Fetch operation data here
  }

  // Hardcoded for development purposes
  const OPERATION_ID = "002d5a9e-32a6-4191-938c-2c02bfec592d";
  if (isRegistrationPurposePage) {
    regulatedProducts = await getRegulatedProducts();
  }
  if (isFacilityPage) {
    // Fetch facility data here
    facilityInitialData = await fetchFacilitiesPageData(
      OPERATION_ID,
      searchParams,
    );
  }

  const formSchema = isRegistrationPurposePage
    ? createOperationRegistrationSchema(registrationSchema, regulatedProducts)
    : registrationSchema;

  return (
    <OperationRegistrationForm
      schema={formSchema}
      formData={{}}
      facilityInitialData={facilityInitialData}
    />
  );
};

export default OperationRegistrationPage;
