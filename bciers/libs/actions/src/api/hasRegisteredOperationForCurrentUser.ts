import { actionHandler } from "@bciers/actions";

export default async function hasRegisteredOperationForCurrentUser() {
  return actionHandler(
    "registration/user-operators/current/has_registered_operation",
    "GET",
  );
}
