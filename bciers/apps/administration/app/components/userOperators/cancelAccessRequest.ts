import { UUID } from "crypto";
import { actionHandler } from "@bciers/actions";

export default async function cancelAccessRequest(
  userOperatorId: UUID,
): Promise<boolean | { error: string }> {
  const response = await actionHandler(
    `registration/user-operators/${userOperatorId}`,
    "DELETE",
    "",
  );
  return response;
}
