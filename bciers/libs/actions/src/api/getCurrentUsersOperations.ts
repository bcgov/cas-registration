import { actionHandler } from "@bciers/actions";

async function getCurrentUsersOperations() {
  return actionHandler("registration/operations/current", "GET", "");
}

export default getCurrentUsersOperations;
