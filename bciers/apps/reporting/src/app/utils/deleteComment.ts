import { actionHandler } from "@bciers/actions";

export async function deleteComment(
  commentId: number,
): Promise<number | { error: string }> {
  const endpoint = `reporting/v2/comments/${commentId}`;

  const response: number = await actionHandler(endpoint, "DELETE");
  return response;
}
