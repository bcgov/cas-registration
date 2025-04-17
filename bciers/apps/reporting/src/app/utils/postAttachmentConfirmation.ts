import { actionHandler } from "@bciers/actions";

async function postAttachmentConfirmation(
  reportVersionId: number,
  formData: FormData,
) {
  const endpoint = `reporting/report-version/${reportVersionId}/attachment-confirmation`;
  const response = await actionHandler(endpoint, "POST", "", {
    body: formData,
  });

  return response;
}

export default postAttachmentConfirmation;
