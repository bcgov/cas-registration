import { actionHandler } from "@bciers/actions";

async function getReportingActivities() {
  try {
    return await actionHandler("registration/reporting_activities", "GET", "");
  } catch (error) {
    throw error;
  }
}

export default getReportingActivities;
