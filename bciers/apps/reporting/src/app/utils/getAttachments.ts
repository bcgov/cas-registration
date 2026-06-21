import { actionHandler } from "@bciers/actions";

// 🛠️ Function to fetch a contact by id
export default async function getAttachments(reportVersionId: number) {
  const endpoint = `reporting/report-version/${reportVersionId}/attachments`;
  const response = await actionHandler(endpoint, "GET");

  return response;
}
