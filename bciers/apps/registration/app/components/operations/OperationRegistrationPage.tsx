import { UUID } from "crypto";
import { validate as isValidUUID } from "uuid";
import OperationRegistrationForm from "./OperationRegistrationForm";
import { operationRegistrationSchema } from "apps/registration/app/data/jsonSchema/operationRegistration";
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
  const section1Dependencies = localSchema.properties.section1.dependencies;
  const regulatedProductsSchema =
    section1Dependencies.registration_purpose.allOf[0].then.properties
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

const OperationRegistration = async ({
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
  return (
    <OperationRegistrationForm
      schema={
        isRegistrationPurposePage
          ? createOperationRegistrationSchema(
              operationRegistrationSchema,
              regulatedProducts,
            )
          : operationRegistrationSchema
      }
      formData={{}}
      facilityInitialData={facilityInitialData}
    />
  );
};

export default OperationRegistration;
