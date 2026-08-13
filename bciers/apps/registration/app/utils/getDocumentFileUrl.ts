import { actionHandler } from "@bciers/actions";

export async function getDocumentFileUrl(documentId: number): Promise<string> {
  const endpoint = `registration/documents/${documentId}`;
  const response = await actionHandler(endpoint, "GET", "");

  return response as string;
}
