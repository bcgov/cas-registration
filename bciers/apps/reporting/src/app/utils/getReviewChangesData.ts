import { actionHandler } from "@bciers/actions";

export async function getChangeReviewData(reportVersionId: number) {
  const endpoint = `reporting/report-version/${reportVersionId}/diff-data`;
  const response = await actionHandler(endpoint, "GET");
  if (response.error) {
    throw new Error(
      `Failed to fetch Changes review data for report version ${reportVersionId}.`,
    );
  }
  return response;
}
