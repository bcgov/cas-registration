import { actionHandler } from "@bciers/actions";

async function getOperationWithDocuments(id: string) {
  const response = await actionHandler(
    `registration/v2/operations/${id}/with-documents`,
    "GET",
    "",
  );
  return response;
}

export default getOperationWithDocuments;
