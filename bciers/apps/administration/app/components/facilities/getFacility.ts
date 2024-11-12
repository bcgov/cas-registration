import { actionHandler } from "@bciers/actions";
import { UUID } from "crypto";

// 🛠️ Function to fetch a facility by uuid
export default async function getFacility(uuid: UUID) {
  return actionHandler(
    `registration/facilities/${uuid}`,
    "GET",
    `/facilities/${uuid}`,
  );
}
