import { actionHandler } from "@bciers/actions";

async function postAttachments(reportVersionId: number, fileData: FormData) {
  const endpoint = `reporting/report-version/${reportVersionId}/attachments`;
  const response = await actionHandler(endpoint, "POST", "", {
    body: fileData,
  });

  return response;
}

export default postAttachments;
