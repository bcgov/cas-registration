import { actionHandler } from "@bciers/actions";

// 🛠️ Function to fetch a contact by id
export default async function getAttachmentsList() {
  const endpoint = `reporting/attachments`;
  const response = await actionHandler(endpoint, "GET");
  if (response.error) {
    throw new Error(`Failed to fetch the attachments`);
  }
  return response;
}
