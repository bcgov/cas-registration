import { actionHandler } from "@bciers/actions";

export const getAllActivities = async () => {
  return actionHandler(`reporting/activities`, "GET", `reporting/activities`);
};
