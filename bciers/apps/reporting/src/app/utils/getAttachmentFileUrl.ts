import { actionHandler } from "@bciers/actions";

export default async function getAttachmentFileUrl(
  reportVersionId: number,
  fileId: number,
) {
  const endpoint = `reporting/report-version/${reportVersionId}/attachments/${fileId}`;
  const response = await actionHandler(endpoint, "GET", "");
  if (response.error) {
    throw new Error(`Failed to fetch attachment URL.`);
  }
  return response;
}
