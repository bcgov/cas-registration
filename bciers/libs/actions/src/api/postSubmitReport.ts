import { actionHandler } from "../actions";

async function postSubmitReport(report_version_id: number, data: any) {
  const endpoint = `reporting/report-version/${report_version_id}/submit`;
  const pathToRevalidate = `reporting/reports/${report_version_id}/submitted`;
  return actionHandler(endpoint, "POST", pathToRevalidate, {
    body: JSON.stringify(data),
  });
}

export default postSubmitReport;
