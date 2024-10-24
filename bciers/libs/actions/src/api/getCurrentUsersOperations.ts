import { actionHandler } from "@bciers/actions";

async function getCurrentUsersOperations() {
  const response = await actionHandler(
    "registration/v2/operations/current",
    "GET",
    "",
  );
  return response;
}

export default getCurrentUsersOperations;
