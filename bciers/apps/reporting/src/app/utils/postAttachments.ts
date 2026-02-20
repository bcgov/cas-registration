import { actionHandler } from "@bciers/actions";

async function postAttachments(reportVersionId: number, fileData: FormData) {
  const endpoint = `reporting/report-version/${reportVersionId}/attachments`;
  return await actionHandler(endpoint, "POST", endpoint, {
    body: fileData,
  });
}

export default postAttachments;
