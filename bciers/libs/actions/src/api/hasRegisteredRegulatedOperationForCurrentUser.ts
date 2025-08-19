import { actionHandler } from "@bciers/actions";

export default async function hasRegisteredRegulatedOperationForCurrentUser() {
  return actionHandler(
    "registration/user-operators/current/has_registered_regulated_operation",
    "GET",
  );
}
