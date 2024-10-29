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
import getFacility from "./getFacility";
import { FacilityTypes, OperationTypes } from "@bciers/utils/src/enums";
import { getOperation } from "@bciers/actions/api";

// 🧩 Main component
export default async function Facility({
  facilityId,
  operationId,
}: {
  facilityId?: UUID;
  operationId: UUID;
}) {
  let facilityFormData: { [key: string]: any } | { error: string } = {};

  const operation = await getOperation(operationId);
  if (operation.error) {
    throw new Error(
      "We couldn't find your operation information. Please ensure you have been approved for access to this operation.",
    );
  }

  const isSfo = operation.type === OperationTypes.SFO;

  let isCreating = true;

  if (facilityId) {
    facilityFormData = await getFacility(facilityId);
    isCreating = Object.keys(facilityFormData).length === 0;
    if (facilityFormData?.error) {
      throw new Error(
        "We couldn't find your facility information. Please ensure you have been approved for access to this facility.",
      );
    }
  } else if (isSfo) {
    // Pre-populate facility name and type for SFO Operations
    facilityFormData = {
      name: operation.name,
      type: FacilityTypes.SFO,
    };
  }

  return (
    <FacilityForm
      schema={isSfo ? facilitiesSfoSchema : facilitiesLfoSchema}
      uiSchema={isSfo ? facilitiesSfoUiSchema : facilitiesLfoUiSchema}
      formData={facilityFormData}
      isCreating={isCreating}
    />
  );
}
