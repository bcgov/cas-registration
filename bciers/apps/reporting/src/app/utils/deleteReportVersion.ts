import { actionHandler } from "@bciers/actions";

async function deleteReportVersion(reportVersionId: number) {
  const method = "DELETE";
  const endpoint = `reporting/report-version/${reportVersionId}`;
  const response = await actionHandler(endpoint, method);

  return response;
}

export default deleteReportVersion;
