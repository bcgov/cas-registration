import { actionHandler } from "@bciers/actions";

async function postDocuments(reportVersionId: number, fileData: FormData) {
  const endpoint = `registration/documents`;
  const response = await actionHandler(endpoint, "POST", "", {
    body: fileData,
  });

  return response;
}

export default postDocuments;
