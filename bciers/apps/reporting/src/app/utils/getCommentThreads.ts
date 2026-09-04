import { actionHandler } from "@bciers/actions";
import { ReportingResponse } from "@reporting/src/app/utils/typesApiV2";
import { Thread } from "@reporting/src/app/components/comments/types";

export async function getCommentThreads(
  reportVersionId: number,
  facilityId?: string,
): Promise<Thread[]> {
  let endpoint = `reporting/v2/report-version/${reportVersionId}/threads`;

  if (facilityId) {
    endpoint += `?facility_id=${facilityId}`;
  }

  const response: ReportingResponse<{ threads: Thread[] }> =
    await actionHandler(endpoint, "GET");
  return response.payload.threads;
}
