import { actionHandler } from "@bciers/actions";

async function getReportingActivities() {
  const response = await actionHandler(
    "registration/reporting_activities",
    "GET",
    "",
  );
  return response;
}

export default getReportingActivities;
