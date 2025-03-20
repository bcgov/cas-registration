import { actionHandler } from "../actions";

async function postSubmitReport(report_version_id: number, payload: any) {
  const endpoint = `reporting/report-version/${report_version_id}/submit`;
  return actionHandler(endpoint, "POST", endpoint, {
    body: JSON.stringify(payload),
  });
}

export default postSubmitReport;
