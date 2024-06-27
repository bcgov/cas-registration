import { actionHandler } from "@bciers/utils/actions";
import { UUID } from "crypto";

// 🛠️ Function to fetch a facility by uuid
export default async function getFacility(uuid: UUID) {
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
