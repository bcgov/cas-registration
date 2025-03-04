import { actionHandler } from "@bciers/actions";

async function postSupplementaryReport(reportVersionId: number) {
  const method = "POST";
  const endpoint = `reporting/report-version/${reportVersionId}/x`;
  const response = await actionHandler(endpoint, method);
  if (response && response.error) {
    throw new Error(
      `Failed to create the supplementary report for report version ${reportVersionId}`,
    );
  }
  return response;
}

export default postSupplementaryReport;
