import { actionHandler } from "@bciers/actions";

async function getCurrentUsersOperations() {
  return actionHandler("registration/v2/operations/current", "GET", "");
}

export default getCurrentUsersOperations;
