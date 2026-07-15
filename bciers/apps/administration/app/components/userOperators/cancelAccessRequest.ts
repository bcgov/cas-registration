import { UUID } from "crypto";
import { safeClientRequest } from "@bciers/actions/safeClientRequest";

export default async function cancelAccessRequest(
  userOperatorId: UUID,
): Promise<{ data: any; error: string | null }> {
  return await safeClientRequest(
    `registration/user-operators/${userOperatorId}`,
    "DELETE",
    "",
  );
}
