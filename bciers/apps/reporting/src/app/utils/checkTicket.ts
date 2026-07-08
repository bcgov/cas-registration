import { actionHandler } from "@bciers/actions";
import { Comment } from "../components/comments/types";
export async function checkTicket(threadId: number): Promise<Comment> {
  const endpoint = `reporting/comment/resolve/thread_id/${threadId}`;

  const method = "PATCH";

  const payload = JSON.stringify({
    is_resolved: true,
  });

  return await actionHandler(endpoint, method, "", {
    body: payload,
  });
}
