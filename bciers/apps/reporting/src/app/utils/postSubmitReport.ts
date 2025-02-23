import { actionHandler } from "@bciers/actions";

async function postSubmitReport(reportVersionId: number) {
  const endpoint = `reporting/report-version/${reportVersionId}/submit`;
  return actionHandler(endpoint, "POST");
}

export default postSubmitReport;
