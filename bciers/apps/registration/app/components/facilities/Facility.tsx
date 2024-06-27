import {
  facilitiesSchemaSfo,
  facilitiesUiSchema,
} from "../../utils/jsonSchema/facilitiesSfo";
import { facilitiesSchemaLfo } from "../../utils/jsonSchema/facilitiesLfo";
import FacilitiesForm from "./FacilitiesForm";
import { UUID } from "crypto"; //brianna check this impoart
import { notFound } from "next/navigation";
import { actionHandler } from "@bciers/utils/actions";

// 🛠️ Function to fetch a facility by uuid
async function getFacility(uuid: UUID) {
  try {
    return await actionHandler(
      `registration/facilities/${uuid}`,
      "GET",
      `/facilities/${uuid}`,
    );
  } catch (error) {
    // Handle the error here or rethrow it to handle it at a higher level
    throw error;
  }
}

async function getOperation(id: string) {
  try {
    return await actionHandler(
      `registration/operations/${id}`,
      "GET",
      `/operations/${id}`,
    );
  } catch (error) {
    // Handle the error here or rethrow it to handle it at a higher level
    throw error;
  }
}

// 🧩 Main component
export default async function Facility({
  facilityId,
  operationId,
}: {
  facilityId?: UUID;
  operationId: UUID;
}) {
  let facilityFormData: { [key: string]: any } | { error: string } | undefined =
    undefined;

  if (facilityId) {
    facilityFormData = await getFacility(facilityId);
    if (facilityFormData?.error) {
      // brianna did we have some global error handling for this is part 1?
      return notFound();
    }
  }
  const operation = await getOperation(operationId);
  if (operation.error) {
    // brianna did we have some global error handling for this is part 1?
    return notFound();
  }

  return (
    <>
      <FacilitiesForm
        schema={
          operation.type === "Single Facility Operation"
            ? facilitiesSchemaSfo
            : facilitiesSchemaLfo
        }
        uiSchema={facilitiesUiSchema}
        {...(facilityFormData ? { formData: facilityFormData } : {})}
        {...(facilityFormData ? { disabled: true } : {})}
      />
    </>
  );
}
