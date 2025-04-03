import { actionHandler } from "@bciers/actions";

async function deleteReportVersion(reportVersionId: number) {
  const method = "DELETE";
  const endpoint = `reporting/report-version/${reportVersionId}`;
  const response = await actionHandler(endpoint, method);
  if (response && response.error) {
    throw new Error(`Failed to delete report version ${reportVersionId}`);
  }
  return response;
}

export default deleteReportVersion;
