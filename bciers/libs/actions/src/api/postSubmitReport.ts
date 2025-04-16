import { actionHandler } from "../actions";

async function postSubmitReport(report_version_id: number, data: any) {
  const endpoint = `reporting/report-version/${report_version_id}/submit`;

  return actionHandler(endpoint, "POST", endpoint, {
    body: JSON.stringify(data),
  });
}

export default postSubmitReport;
