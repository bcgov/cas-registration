import { actionHandler } from "../actions";

async function postSubmitReport(report_version_id: number) {
  const endpoint = `reporting/report-version/${report_version_id}/submit`;
  return actionHandler(endpoint, "POST", endpoint);
}

export default postSubmitReport;
