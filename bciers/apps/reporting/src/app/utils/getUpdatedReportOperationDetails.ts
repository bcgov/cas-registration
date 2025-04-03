import { actionHandler } from "@bciers/actions";

export async function getUpdatedReportOperationDetails(
  reportVersionId: number,
) {
  const endpoint = `reporting/report-version/${reportVersionId}/report-operation/update`;
  const response = await actionHandler(endpoint, "GET");
  if (response.error) {
    throw new Error(`Failed to fetch updated Operation Data`);
  }
  return response;
}
