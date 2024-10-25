import { actionHandler } from "@bciers/actions";

async function getOperationWithDocuments(id: string) {
  return actionHandler(
    `registration/v2/operations/${id}/with-documents`,
    "GET",
    "",
  );
}

export default getOperationWithDocuments;
