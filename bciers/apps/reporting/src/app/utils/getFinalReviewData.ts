import { actionHandler } from "@bciers/actions";

export async function getFinalReviewData(reportVersionId: number) {
  const endpoint = `reporting/report-version/${reportVersionId}/final-review`;
  const response = await actionHandler(endpoint, "GET");

  return response;
}
