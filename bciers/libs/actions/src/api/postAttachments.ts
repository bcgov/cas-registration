import { actionHandler } from "../actions";

async function postAttachments(report_version_id: number, fileData: FormData) {
  const endpoint = `reporting/report-version/${report_version_id}/attachments`;
  return actionHandler(endpoint, "POST", endpoint, {
    body: fileData,
  });
}

export default postAttachments;
