import { actionHandler } from "@bciers/actions";

// 🛠️ Function to fetch a contact by id
export default async function getAttachments(report_version_id: number) {
  const endpoint = `reporting/report-version/${report_version_id}/attachments`;
  return actionHandler(endpoint, "GET", "");
}
