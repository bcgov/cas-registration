import { actionHandler } from "../actions";

async function postAttachments(report_version_id: number, data: any) {
  const endpoint = `reporting/report-version/${report_version_id}/attachments`;
  return actionHandler(endpoint, "POST", endpoint, {
    body: JSON.stringify(data),
  });
}

export default postAttachments;
