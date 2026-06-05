import { actionHandler } from "@bciers/actions";

export async function getElectricityImportData(reportVersionId: number) {
  const endpoint = `reporting/report-version/${reportVersionId}/electricity-import-data`;
  const response = await actionHandler(endpoint, "GET");

  return response;
}
