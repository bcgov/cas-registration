import { InternalFrontEndRoles } from "@bciers/utils/src/enums";
import { actionHandler } from "@bciers/actions";
import { UUID } from "crypto";

async function handleInternalAccessRequest(
  userId: UUID,
  roleUpdate: InternalFrontEndRoles,
  archive: boolean,
) {
  if (!roleUpdate) return;
  const response = await actionHandler(
    `registration/users/${userId}`,
    "PATCH",
    "",
    {
      body: JSON.stringify({
        app_role: roleUpdate,
        archive,
      }),
    },
  );
  return response;
}
export default handleInternalAccessRequest;
