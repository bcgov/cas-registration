import {
  facilitiesSfoSchema,
  facilitiesSfoUiSchema,
} from "../../data/jsonSchema/facilitiesSfo";
import {
  facilitiesLfoSchema,
  facilitiesLfoUiSchema,
} from "../../data/jsonSchema/facilitiesLfo";
import { UUID } from "crypto";
import FacilityForm from "./FacilityForm";
import { FacilityFormData, Operation } from "./types";
import getFacility from "./getFacility";
import { FacilityTypes, OperationTypes } from "@bciers/utils/src/enums";
import { getOperation } from "@bciers/actions/api";
import NewTabBanner from "@bciers/components/layout/NewTabBanner";

export default async function Facility({
  facilityId,
  operationId,
}: {
  facilityId?: UUID;
  operationId: UUID;
}) {
  let facilityFormData: FacilityFormData = {};

  const operation = (await getOperation(operationId)) as Operation;
  const isSfo = operation.type === OperationTypes.SFO;

  let isCreating = true;

  if (facilityId) {
    facilityFormData = await getFacility(facilityId);
    isCreating = Object.keys(facilityFormData).length === 0;
  } else if (isSfo) {
    facilityFormData = {
      name: operation.name,
      type: FacilityTypes.SFO,
    };
  }

  return (
    <>
      <NewTabBanner />
      <FacilityForm
        schema={isSfo ? facilitiesSfoSchema : facilitiesLfoSchema}
        uiSchema={isSfo ? facilitiesSfoUiSchema : facilitiesLfoUiSchema}
        formData={facilityFormData}
        isCreating={isCreating}
      />
    </>
  );
}
