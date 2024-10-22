import { actionHandler } from "@bciers/actions";
import { UUID } from "crypto";

// 🛠️ Function to get an operator by operator id
export default async function getOperator(id: UUID) {
  try {
    return await actionHandler(
      `registration/operators/${id}`,
      "GET",
      `/select-operator/confirm/${id}`,
    );
  } catch (error) {
    // Handle the error here or rethrow it to handle it at a higher level
    throw error;
  }
}
