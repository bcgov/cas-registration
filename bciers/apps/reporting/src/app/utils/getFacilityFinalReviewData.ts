import { actionHandler } from "@bciers/actions";

export async function getFacilityFinalReviewData(
  reportVersionId: number,
  facility_id: string,
) {
  const endpoint = `reporting/report-version/${reportVersionId}/final-review/${facility_id}/facility-reports`;
  const response = await actionHandler(endpoint, "GET");

  return response;
}
