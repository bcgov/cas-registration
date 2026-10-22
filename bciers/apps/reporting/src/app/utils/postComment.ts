import { actionHandler } from "@bciers/actions";
import { Thread } from "../components/comments/types";

async function postComment(
  reportVersionId: number,
  comment: string,
  threadId: number,
) {
  const endpoint = `reporting/v2/report-version/${reportVersionId}/threads/${threadId}/comment`;
  const pathToRevalidate = `reporting/v2/report-version/${reportVersionId}/threads/${threadId}/comment`;
  const response = await actionHandler(endpoint, "POST", pathToRevalidate, {
    body: JSON.stringify({
      comment: comment,
    }),
  });

  return response as Thread;
}

export default postComment;
