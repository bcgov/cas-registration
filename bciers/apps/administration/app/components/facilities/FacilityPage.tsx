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
  let facilityFormData: FacilityFormData | { error: string } = {};

  const operation = (await getOperation(operationId)) as
    | Operation
    | { error: string };
  if ("error" in operation) {
    throw new Error(
      "We couldn't find your operation information. Please ensure you have been approved for access to this operation.",
    );
  }
  const isSfo = operation.type === OperationTypes.SFO;

  let isCreating = true;

  if (facilityId) {
    facilityFormData = await getFacility(facilityId);
    if ("error" in facilityFormData) {
      throw new Error(
        "We couldn't find your facility information. Please ensure you have been approved for access to this facility.",
      );
    }
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
