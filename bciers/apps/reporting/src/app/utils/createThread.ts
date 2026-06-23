import { actionHandler } from "@bciers/actions";
import { UUID } from "crypto";

export async function createCommentThread(
  version_id: number,
  title: string,
  section?: string,
  facilityId?: UUID,
) {
  let endpoint = `reporting/comments/version_id/${version_id}`;
  if (facilityId) {
    endpoint = `${endpoint}/facility_id/${facilityId}`;
  }
  const method = "POST";

  return await actionHandler(endpoint, method, "", {
    body: JSON.stringify({
      title: title,
      report_section: section,
    }),
  });
}
