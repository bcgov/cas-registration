import { actionHandler } from "@bciers/actions";
import { TrainStations } from "@bciers/utils/src/enums";
import { Thread } from "../components/comments/types";

export async function createCommentThread(
  title: string,
  version_id: number,
  facility_id?: string,
  section?: TrainStations,
): Promise<Thread> {
  let endpoint = `reporting/comments/version_id/${version_id}`;
  if (facility_id) {
    endpoint = `${endpoint}?facility_id=${facility_id}`;
  }
  const method = "POST";

  return await actionHandler(endpoint, method, "", {
    body: JSON.stringify({
      title: title,
      report_section: section,
    }),
  });
}
