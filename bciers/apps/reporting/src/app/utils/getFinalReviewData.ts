import { actionHandler } from "@bciers/actions";

export async function getFinalReviewData(reportVersionId: number) {
  const endpoint = `reporting/report-version/${reportVersionId}/final-review`;
  const response = await actionHandler(endpoint, "GET");
  if (response.error) {
    throw new Error(
      `Failed to fetch final review data for report version ${reportVersionId}.`,
    );
  }
  return response;
}
