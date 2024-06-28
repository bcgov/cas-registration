import {
  facilitiesSchemaSfo,
  facilitiesUiSchema,
} from "../../utils/jsonSchema/facilitiesSfo";
import { facilitiesSchemaLfo } from "../../utils/jsonSchema/facilitiesLfo";
import FacilitiesForm from "./FacilitiesForm";
import { UUID } from "crypto";
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
    facilityFormData = await getFacility(facilityId);
    if (facilityFormData?.error) {
      // brianna did we have some global error handling for this is part 1?
      return notFound();
    }
  }
  const operation = await getOperation(operationId);
  console.log("getoperation", getOperation);
  console.log("operation", operation);
  if (operation.error) {
    // brianna did we have some global error handling for this is part 1?
    return notFound();
  }
  const isCreating = Object.keys(facilityFormData).length > 0 ? false : true;
  return (
    <>
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
    </>
  );
}
