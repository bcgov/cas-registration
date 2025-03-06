import { actionHandler } from "@bciers/actions";

async function postSupplementaryReportVersion(reportVersionId: number) {
  const method = "POST";
  const endpoint = `reporting/report-version/${reportVersionId}/create-supplementary-report-version`;
  const response = await actionHandler(endpoint, method);
  if (response && response.error) {
    throw new Error(
      `Failed to create the supplementary report version for report version ${reportVersionId}`,
    );
  }
  return response;
}

export default postSupplementaryReportVersion;
