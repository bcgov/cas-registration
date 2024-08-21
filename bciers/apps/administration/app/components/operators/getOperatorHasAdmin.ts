import { actionHandler } from "@bciers/actions";

// 🛠️ Function to get an operator administrator by operator id
export default async function getOperatorHasAdmin(id: string) {
  try {
    return await actionHandler(
      `registration/operators/${id}/has-admin`,
      "GET",
      `/select-operator/confirm/${id}`,
    );
  } catch (error) {
    // Handle the error here or rethrow it to handle it at a higher level
    throw error;
  }
}
