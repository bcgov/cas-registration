import { actionHandler } from "@bciers/actions";

async function getCurrentUsersOperations() {
  try {
    return await actionHandler("registration/v2/operations/current", "GET", "");
  } catch (error) {
    throw error;
  }
}

export default getCurrentUsersOperations;
