import { actionHandler } from "@bciers/actions";

async function postSupplementaryReportVersion(reportVersionId: number) {
  const method = "POST";
  const endpoint = `reporting/report-version/${reportVersionId}/create-report-supplementary-version`;
  const response = await actionHandler(endpoint, method);

  return response;
}

export default postSupplementaryReportVersion;
