import { actionHandler } from "@bciers/actions";
import { ReportingResponse } from "@reporting/src/app/utils/typesApiV2";
import { ThreadsResponse } from "@reporting/src/app/components/comments/types";

export async function getCommentThreads(
  reportVersionId: number,
): Promise<ThreadsResponse> {
  const endpoint = `reporting/v2/report-version/${reportVersionId}/threads`;

  const response: ReportingResponse<ThreadsResponse> = await actionHandler(
    endpoint,
    "GET",
  );
  return response.payload;
}
