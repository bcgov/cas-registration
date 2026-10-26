import { actionHandler } from "@bciers/actions";

export async function deleteComment(commentId: number) {
  const endpoint = `reporting/v2/comments/${commentId}`;

  const response = await actionHandler(endpoint, "DELETE");
  return response;
}
