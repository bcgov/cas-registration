import { UUID } from "crypto";
import FacilityInformationForm from "apps/registration/app/components/operations/registration/FacilityInformationForm";
import {
  facilityInformationSchemaLfo,
  facilityInformationSchemaSfo,
} from "apps/registration/app/data/jsonSchema/operationRegistration/facilityInformation";
import fetchFacilitiesPageData from "@/administration/app/components/facilities/fetchFacilitiesPageData";
import { FacilitiesSearchParams } from "apps/administration/app/components/facilities/types";
import { FacilityTypes, OperationTypes } from "@bciers/utils/enums";

const FacilityInformationPage = async ({
  operation,
  operationName,
  operationType,
  searchParams,
  step,
  steps,
}: {
  operation: UUID | "create";
  operationName: string;
  operationType: OperationTypes;
  searchParams: FacilitiesSearchParams;
  step: number;
  steps: string[];
}) => {
  const isOperationSfo = operationType === OperationTypes.SFO;

  const initialGridData = await fetchFacilitiesPageData(
    operation,
    searchParams,
  );

  const formSchema = isOperationSfo
    ? facilityInformationSchemaSfo
    : facilityInformationSchemaLfo;

  // Single facility operations get read-only name and type fields pre-populated
  const formData = isOperationSfo
    ? { section1: { name: operationName, type: FacilityTypes.SFO } }
    : {};

  return (
    <FacilityInformationForm
      initialGridData={initialGridData}
      formData={formData}
      operation={operation}
      isSfo={isOperationSfo}
      schema={formSchema}
      step={step}
      steps={steps}
    />
  );
};

export default FacilityInformationPage;
