import { actionHandler } from "@bciers/actions";

// 🛠️ Function to get a useroperator by status pending
export default async function getUserOperator() {
  try {
    return await actionHandler(
      `registration/user-operators/pending`,
      "GET",
      "",
    );
  } catch (error) {
    // Handle the error here or rethrow it to handle it at a higher level
    throw error;
  }
}
