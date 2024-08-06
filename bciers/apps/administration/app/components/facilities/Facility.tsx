import {
  facilitiesSfoSchema,
  facilitiesSfoUiSchema,
} from "../../data/jsonSchema/facilitiesSfo";
import {
  facilitiesLfoSchema,
  facilitiesLfoUiSchema,
} from "../../data/jsonSchema/facilitiesLfo";
import FacilitiesForm from "./FacilitiesForm";
import { UUID } from "crypto";
import { notFound } from "next/navigation";
import getFacility from "./getFacility";
import { FacilityTypes, OperationTypes } from "@bciers/utils/enums";
import { getOperation } from "@bciers/actions/api";

// 🧩 Main component
export default async function Facility({
  facilityId,
  operationId,
}: {
  facilityId?: UUID;
  operationId: UUID;
}) {
  const operation = await getOperation(operationId);
  if (operation.error) {
    return notFound();
  }

  const isSfo = operation.type === OperationTypes.SFO;

  let facilityFormData: { [key: string]: any } | { error: string } = {};
  let isCreating = true;

  if (facilityId) {
    facilityFormData = await getFacility(facilityId);
    isCreating = Object.keys(facilityFormData).length === 0;
    if (facilityFormData?.error) {
      return notFound();
    }
  } else if (isSfo) {
    // Pre-populate facility name and type for SFO Operations
    facilityFormData = {
      name: operation.name,
      type: FacilityTypes.SFO,
    };
  }

  return (
    <FacilitiesForm
      schema={isSfo ? facilitiesSfoSchema : facilitiesLfoSchema}
      uiSchema={isSfo ? facilitiesSfoUiSchema : facilitiesLfoUiSchema}
      formData={facilityFormData}
      isCreating={isCreating}
    />
  );
}
