import { actionHandler } from "@bciers/actions";

async function postAttachments(reportVersionId: number, fileData: FormData) {
  const endpoint = `reporting/report-version/${reportVersionId}/attachments`;
  const pathToRevalidate = `reporting/reports/${reportVersionId}/attachments`;
  return await actionHandler(endpoint, "POST", pathToRevalidate, {
    body: fileData,
  });
}

export default postAttachments;
