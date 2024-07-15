import {
  facilitiesSchemaSfo,
  facilitiesUiSchema,
} from "../../data/jsonSchema/facilitiesSfo";
import { facilitiesSchemaLfo } from "../../data/jsonSchema/facilitiesLfo";
import FacilitiesForm from "./FacilitiesForm";
import { UUID } from "crypto";
import { validate as isValidUUID } from "uuid";
import { notFound } from "next/navigation";
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
    if (isValidUUID(facilityId)) {
      facilityFormData = await getFacility(facilityId);
      if (facilityFormData?.error) {
        // return notFound();
      }
    }
  }
  const operation = await getOperation(operationId);
  if (operation.error) {
    // return notFound();
  }
  const isCreating = Object.keys(facilityFormData).length === 0;
  return (
    <FacilitiesForm
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
