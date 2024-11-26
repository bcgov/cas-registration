import { actionHandler } from "@bciers/actions";
import { UUID } from "crypto";

// 🛠️ Function to fetch a facility by uuid
export default async function getFacility(uuid: UUID) {
  return actionHandler(
    `registration/v2/facilities/${uuid}`,
    "GET",
    `/facilities/${uuid}`,
  );
}
