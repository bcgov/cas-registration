import { actionHandler } from "@bciers/actions";

export async function patchComment(
  reportVersionId: number,
  threadId: number,
  commentId: number,
  content: string,
) {
  const endpoint = `reporting/v2/report-version/${reportVersionId}/threads/${threadId}/comments/${commentId}`;

  const pathToRevalidate = `reports/${reportVersionId}/`;
  const response = await actionHandler(endpoint, "PATCH", pathToRevalidate, {
    body: JSON.stringify({
      comment: content,
    }),
  });
  return response;
}
