import { actionHandler } from "@bciers/actions";

// 🛠️ Function to retrieve the list of users associated with the operator of the current user
export default async function getUserOperatorUsers(pathToRevalidate: string) {
  try {
    return await actionHandler(
      "registration/user-operators/current/operator-users",
      "GET",
      pathToRevalidate,
    );
  } catch (error) {
    // Handle the error here or rethrow it to handle it at a higher level
    throw error;
  }
}
