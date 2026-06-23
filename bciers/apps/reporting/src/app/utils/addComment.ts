import { actionHandler } from "@bciers/actions";

export async function addCommentToThread(
  threadId: number,
  comment: string,
  version_id: number,
) {
  const endpoint = `reporting/comment/version_id/${version_id}/thread_id/${threadId}`;
  const method = "POST";
  const payload = JSON.stringify({
    comment: comment,
  });

  return await actionHandler(endpoint, method, "", {
    body: payload,
  });
}
