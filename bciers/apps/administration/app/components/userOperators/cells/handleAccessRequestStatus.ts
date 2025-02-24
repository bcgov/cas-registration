import { Status, UserOperatorRoles } from "@bciers/utils/src/enums";
import { actionHandler } from "@bciers/actions";

export default async function handleAccessRequestStatus(
  userOperatorId: string,
  statusUpdate: Status,
  roleUpdate: UserOperatorRoles,
) {
  const response = await actionHandler(
    `registration/user-operators/${userOperatorId}/status`,
    "PATCH",
    "",
    {
      body: JSON.stringify({
        role: roleUpdate,
        status: statusUpdate,
      }),
    },
  );
  return response;
}
