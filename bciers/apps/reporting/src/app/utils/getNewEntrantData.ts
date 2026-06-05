import { actionHandler } from "@bciers/actions";

export async function getNewEntrantData(reportVersionId: number) {
  const endpoint = `reporting/report-version/${reportVersionId}/new-entrant-data`;
  const response = await actionHandler(endpoint, "GET");

  return response;
}
