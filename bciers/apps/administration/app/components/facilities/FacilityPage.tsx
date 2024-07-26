import {
  facilitiesSchemaSfo,
  facilitiesUiSchema,
} from "../../data/jsonSchema/facilitiesSfo";
import { facilitiesSchemaLfo } from "../../data/jsonSchema/facilitiesLfo";
import FacilityForm from "./FacilityForm";
import { UUID } from "crypto";
import getFacility from "./getFacility";
import getOperation from "../operations/getOperation";

// 🧩 Main component
export default async function Facility({
  facilityId,
  operationId,
}: {
  facilityId?: UUID;
  operationId: UUID;
}) {
  let facilityFormData: { [key: string]: any } | { error: string } = {};

  if (facilityId) {
    facilityFormData = await getFacility(facilityId);
    if (facilityFormData?.error) {
      throw new Error(
        "We couldn't find your facility information. Please ensure you have been approved for access to this facility.",
      );
    }
  }
  const operation = await getOperation(operationId);
  if (operation.error) {
    throw new Error(
      "We couldn't find your operation information. Please ensure you have been approved for access to this operation.",
    );
  }
  const isCreating = Object.keys(facilityFormData).length === 0;
  return (
    <FacilityForm
      schema={
        operation.type === "Single Facility Operation"
          ? facilitiesSchemaSfo
          : facilitiesSchemaLfo
      }
      uiSchema={facilitiesUiSchema}
      formData={facilityFormData}
      isCreating={isCreating}
    />
  );
}
