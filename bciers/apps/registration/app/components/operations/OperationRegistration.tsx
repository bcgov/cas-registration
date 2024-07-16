import { UUID } from "crypto";
import OperationRegistrationForm from "./OperationRegistrationForm";
import { operationRegistrationSchema } from "apps/registration/app/data/jsonSchema/operationRegistration";
import fetchFacilitiesPageData from "@/administration/app/components/facilities/fetchFacilitiesPageData";
import {
  FacilityInitialData,
  FacilitiesSearchParams,
} from "@/administration/app/components/facilities/types";
import { validate as isValidUUID } from "uuid";
const OperationRegistration = async ({
  formSection,
  operation,
  searchParams,
}: {
  formSection: number;
  operation: UUID | "create";
  searchParams: FacilitiesSearchParams;
}) => {
  const isFacilityDataGrid = formSection === 3 && operation;
  let facilityInitialData: FacilityInitialData | undefined;
  if (operation && isValidUUID(operation)) {
    // Fetch operation data here
  }

  // Hardcoded for development purposes
  const OPERATION_ID = "002d5a9e-32a6-4191-938c-2c02bfec592d";
  if (isFacilityDataGrid) {
    // Fetch facility data here
    facilityInitialData = await fetchFacilitiesPageData(
      OPERATION_ID,
      searchParams,
    );
  }
  return (
    <OperationRegistrationForm
      schema={operationRegistrationSchema}
      formData={{}}
      facilityInitialData={facilityInitialData}
    />
  );
};

export default OperationRegistration;
