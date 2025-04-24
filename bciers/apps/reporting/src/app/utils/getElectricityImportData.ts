import { actionHandler } from "@bciers/actions";

export async function getElectricityImportData(reportVersionId: number) {
  const endpoint = `reporting/report-version/${reportVersionId}/electricity-import-data`;
  const response = await actionHandler(endpoint, "GET");
  if (response.error) {
    throw new Error(
      `Failed to fetch the electricity import data for report version ${reportVersionId}.`,
    );
  }
  return response;
}
