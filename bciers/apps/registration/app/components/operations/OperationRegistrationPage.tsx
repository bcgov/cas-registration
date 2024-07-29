import { UUID } from "crypto";
import { validate as isValidUUID } from "uuid";
import OperationRegistrationForm from "./OperationRegistrationForm";
import {
  operationRegistrationSchema,
  operationRegistrationNewEntrantSchema,
} from "apps/registration/app/data/jsonSchema/operationRegistration";
import { facilitiesSchemaLfo } from "apps/administration/app/data/jsonSchema/facilitiesLfo";
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
  isOperationLfo: boolean,
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

  // facility type
  if (isOperationLfo) {
    console.log("localSchema", localSchema);
    localSchema.properties.facilityInformation.properties.facility_information_array.items.properties =
      facilitiesSchemaLfo.properties;
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
  // Need to be careful using formSection as it is not a reliable way to determine the page
  // due to the conditional new entrant page on this form
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
  // Don't fetch operation if UUID is invalid or operation === "create"
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

  // Will need to pull this from the formData;
  const isOperationLfo = true;

  const formSchema = isRegistrationPurposePage
    ? createOperationRegistrationSchema(
        registrationSchema,
        regulatedProducts,
        isOperationLfo,
      )
    : registrationSchema;

  return (
    <OperationRegistrationForm
      schema={formSchema}
      formData={{}}
      formSection={formSection}
      facilityInitialData={facilityInitialData}
      operation={operation}
    />
  );
};

export default OperationRegistrationPage;
