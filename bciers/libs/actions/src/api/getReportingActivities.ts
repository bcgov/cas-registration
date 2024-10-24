import { actionHandler } from "@bciers/actions";

async function getReportingActivities() {
  return actionHandler("registration/reporting_activities", "GET", "");
}

export default getReportingActivities;
