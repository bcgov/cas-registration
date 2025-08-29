import { actionHandler } from "@bciers/actions";

export async function getLfoFinalReviewData(
  reportVersionId: number,
  facility_id: string,
) {
  const endpoint = `reporting/report-version/${reportVersionId}/final-review/${facility_id}/facility-reports`;
  const response = await actionHandler(endpoint, "GET");
  if (response?.error) {
    throw new Error(
      `Failed to fetch final review data for report version ${reportVersionId}.`,
    );
  }
  return response;
}
