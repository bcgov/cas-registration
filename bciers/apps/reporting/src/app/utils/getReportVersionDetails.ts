import { actionHandler } from "@bciers/actions";

export async function getReportVersionDetails(reportVersionId: number) {
  const endpoint = `reporting/report-version/${reportVersionId}`;
  const response = await actionHandler(endpoint, "GET");
  if (response.error) {
    throw new Error(
      `Failed to fetch Report version details for id ${reportVersionId}.`,
    );
  }
  return response;
}
