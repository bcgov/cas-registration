import { actionHandler } from "@bciers/actions";

async function getOperationWithDocuments(id: string) {
  try {
    return await actionHandler(
      `registration/v2/operations/${id}/with-documents`,
      "GET",
      "",
    );
  } catch (error) {
    throw error;
  }
}

export default getOperationWithDocuments;
