import { actionHandler } from "@bciers/actions";

export async function deleteComment(
  reportVersionId: number,
  threadId: number,
  commentId: number,
) {
  const endpoint = `reporting/v2/report-version/${reportVersionId}/threads/${threadId}/comments/${commentId}`;

  const response = await actionHandler(endpoint, "DELETE");
  return response;
}
