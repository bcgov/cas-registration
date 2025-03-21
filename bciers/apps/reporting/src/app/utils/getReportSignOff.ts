import { actionHandler } from "@bciers/actions";

export async function getReportSignOff(reportVersionId: number) {
  const endpoint = `reporting/report-version/${reportVersionId}/sign-off`;
  const response = await actionHandler(endpoint, "GET");
  if (response.error) {
    throw new Error(
      `Failed to fetch the sign off for report version ${reportVersionId}.`,
    );
  }
  return response;
}
