import { actionHandler } from "@bciers/actions";
import { UUID } from "crypto";
import { TrainStations } from "@bciers/utils/src/enums";
import { Thread } from "../components/comments/types";

export async function createCommentThread(
  version_id: number,
  title: string,
  section?: TrainStations,
  facilityId?: UUID,
): Promise<Thread> {
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
