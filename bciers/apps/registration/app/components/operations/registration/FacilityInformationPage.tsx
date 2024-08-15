import { UUID } from "crypto";
import FacilityInformationForm from "apps/registration/app/components/operations/registration/FacilityInformationForm";
import fetchFacilitiesPageData from "@/administration/app/components/facilities/fetchFacilitiesPageData";
import { FacilitiesSearchParams } from "apps/administration/app/components/facilities/types";
import { FacilityTypes, OperationTypes } from "@bciers/utils/enums";
import getFacility from "apps/administration/app/components/facilities/getFacility";
import { createNestedFormData } from "@bciers/components/form/formDataUtils";
import { facilitiesSfoSchema } from "apps/administration/app/data/jsonSchema/facilitiesSfo";

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

  // Is there a cleaner way to get the facilityId for a single facility operation?
  // May be worth creating an API endpoint to get the facilityId for a single facility operation
  // in https://github.com/bcgov/cas-registration/issues/2065
  const facilityId =
    isOperationSfo && initialGridData.rows.length === 1
      ? initialGridData.rows[0].id
      : null;

  // Get facility form data for SFO operations if facilityId is available
  const sfoFacilityData =
    isOperationSfo && facilityId ? await getFacility(facilityId) : null;

  const sfoFormData = sfoFacilityData
    ? // Create nested form data for SFO operations
      createNestedFormData(sfoFacilityData, facilitiesSfoSchema)
    : {
        // Pre-populate facility name and type for SFO Operations
        section1: { name: operationName, type: FacilityTypes.SFO },
      };

  // LFO operations will always have empty form data since they can create multiple facilities
  const formData = isOperationSfo ? sfoFormData : {};

  return (
    <FacilityInformationForm
      facilityId={facilityId}
      isCreating={!isOperationSfo || !facilityId}
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
