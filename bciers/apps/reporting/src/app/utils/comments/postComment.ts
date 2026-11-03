import { actionHandler } from "@bciers/actions";

export async function postComment(
  reportVersionId: number,
  threadId: number,
  comment: string,
) {
  const endpoint = `reporting/v2/report-version/${reportVersionId}/threads/${threadId}/comments`;

  const pathToRevalidate = `reports/${reportVersionId}/`;
  const response = await actionHandler(endpoint, "POST", pathToRevalidate, {
    body: JSON.stringify({
      comment: comment,
    }),
  });
  return response;
}
