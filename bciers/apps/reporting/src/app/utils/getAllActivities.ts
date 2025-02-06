import { actionHandler } from "@bciers/actions";

export async function getAllActivities() {
  return actionHandler(`reporting/activities`, "GET", `reporting/activities`);
}
