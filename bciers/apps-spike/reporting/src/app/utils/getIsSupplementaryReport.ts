import { actionHandler } from "@bciers/actions";

export async function getIsSupplementaryReport(reportVersionId: number) {
  const endpoint = `reporting/report-version/${reportVersionId}/is-supplementary-report-version`;
  const response = await actionHandler(endpoint, "GET");
  if (response.error) {
    throw new Error(
      `Failed to fetch the supplementary report flag for report version ${reportVersionId}.`,
    );
  }
  return response;
}
