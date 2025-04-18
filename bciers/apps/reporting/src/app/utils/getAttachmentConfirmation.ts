import { actionHandler } from "@bciers/actions";

export default async function getAttachmentConfirmation(
  reportVersionId: number,
) {
  const endpoint = `reporting/report-version/${reportVersionId}/attachment-confirmation`;
  const response = await actionHandler(endpoint, "GET");
  if (response && response.error) {
    throw new Error(
      `Failed to fetch the attachment confirmation for report version ${reportVersionId}.`,
    );
  }
  return response;
}
