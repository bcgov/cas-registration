import { UUID } from "crypto";
import FacilityInformationForm from "apps/registration/app/components/operations/registration/FacilityInformationForm";
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
  operation: UUID;
  operationName: string;
  operationType: string;
  searchParams: FacilitiesSearchParams;
  step: number;
  steps: string[];
}) => {

  const isOperationSfo = operationType === OperationTypes.SFO;

  const initialGridData = await fetchFacilitiesPageData(
    operation,
    searchParams,
  );

  // Single facility operations get read-only name and type fields pre-populated
  const formData = isOperationSfo
    ? { section1: { name: operationName, type: FacilityTypes.SFO } }
    : {};

  return (
    <FacilityInformationForm
      initialGridData={initialGridData}
      formData={formData}
      operation={operation}
      isOperationSfo={isOperationSfo}
      step={step}
      steps={steps}
    />
  );
};

export default FacilityInformationPage;
