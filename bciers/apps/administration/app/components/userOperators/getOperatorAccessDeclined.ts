import { actionHandler } from "@bciers/actions";

// 🛠️ Function to get an operator administrator with access declined status by operator id
export default async function getOperatorAccessDeclined(id: string) {
  try {
    return actionHandler(
      `registration/operators/${id}/access-declined`,
      "GET",
      `/select-operator/confirm/${id}`,
    );
  } catch (error) {
    // Handle the error here or rethrow it to handle it at a higher level
    throw error;
  }
}
