import { actionHandler } from "@bciers/actions";

export async function getNewEntrantData(reportVersionId: number) {
  const endpoint = `reporting/report-version/${reportVersionId}/new-entrant-data`;
  const response = await actionHandler(endpoint, "GET");
  if (response.error) {
    throw new Error(
      `Failed to fetch the new entrant data for report version ${reportVersionId}.`,
    );
  }
  return response;
}
