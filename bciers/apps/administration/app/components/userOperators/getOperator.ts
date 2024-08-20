import { actionHandler } from "@bciers/actions";

// 🛠️ Function to get an operator by operator id
export default async function getOperator(id: string) {
  try {
    return actionHandler(
      `registration/operators/${id}`,
      "GET",
      `/select-operator/confirm/${id}`,
    );
  } catch (error) {
    // Handle the error here or rethrow it to handle it at a higher level
    throw error;
  }
}
