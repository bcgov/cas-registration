import { actionHandler } from "@bciers/actions";
import { UUID } from "crypto";

// 🛠️ Function to retrieve the information of the selected user in contact form
export default async function getUserData(id: UUID) {
  try {
    return await actionHandler(`registration/users/${id}`, "GET");
  } catch (error) {
    // Handle the error here or rethrow it to handle it at a higher level
    throw error;
  }
}
