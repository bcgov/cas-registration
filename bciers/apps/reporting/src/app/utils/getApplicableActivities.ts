import { actionHandler } from "@bciers/actions";

export const getApplicableActivities = async (reportVersionId: number) => {
  const endpoint = `reporting/report-version/${reportVersionId}/applicable-activities`;
  const response = await actionHandler(endpoint, "GET");
  if (response.error) {
    throw new Error("Failed to fetch the activities.");
  }
  return response;
};
