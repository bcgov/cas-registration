import { UUID } from "crypto";
import FacilityInformationForm from "apps/registration/app/components/operations/registration/FacilityInformationForm";
import {
  facilityInformationSchemaLfo,
  facilityInformationSchemaSfo,
} from "apps/registration/app/data/jsonSchema/operationRegistration/facilityInformation";
import fetchFacilitiesPageData from "@/administration/app/components/facilities/fetchFacilitiesPageData";
import { FacilitiesSearchParams } from "apps/administration/app/components/facilities/types";
import { OperationData } from "apps/registration/app/components/operations/types";
import { FacilityTypes } from "@bciers/utils/enums";

const FacilityInformationPage = async ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  operation,
  // Should we just pass the name and type or all of the operation data?
  operationData,
  searchParams,
  step,
  steps,
}: {
  operation: UUID | "create";
  operationData: OperationData;
  searchParams: FacilitiesSearchParams;
  step: number;
  steps: string[];
}) => {
  // Hardcoding for development purposes
  const OPERATION_ID = "002d5a9e-32a6-4191-938c-2c02bfec592d";

  // const isOperationSfo = operationData?.type === OperationTypes.SFO;
  const isOperationSfo = false;

  const initialGridData = await fetchFacilitiesPageData(
    // Remember to replace this with the actual operation ID
    OPERATION_ID,
    searchParams,
  );

  const formSchema = isOperationSfo
    ? facilityInformationSchemaSfo
    : facilityInformationSchemaLfo;

  // Single facility operations get read-only name and type fields pre-populated
  const formData = isOperationSfo
    ? { section1: { name: operationData?.name, type: FacilityTypes.SFO } }
    : {};

  return (
    <FacilityInformationForm
      initialGridData={initialGridData}
      formData={formData}
      operation={OPERATION_ID}
      isSfo={isOperationSfo}
      schema={formSchema}
      step={step}
      steps={steps}
    />
  );
};

export default FacilityInformationPage;
