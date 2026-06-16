import { actionHandler } from "@bciers/actions";

export async function getChangeReviewData(reportVersionId: number) {
  const endpoint = `reporting/report-version/${reportVersionId}/diff-data`;
  const response = await actionHandler(endpoint, "GET");

  return response;
}
