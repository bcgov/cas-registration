import { actionHandler } from "@bciers/actions";

// 🛠️ Function to retrieve the list of users associated with the operator of the current user
export default async function getUserOperatorUsers(pathToRevalidate: string) {
  const response = await actionHandler(
    "registration/user-operators/current/operator-users",
    "GET",
    pathToRevalidate,
  );
  return response;
}
