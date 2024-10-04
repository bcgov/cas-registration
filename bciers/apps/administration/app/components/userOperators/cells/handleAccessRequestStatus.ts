import { Status, UserOperatorRoles } from "@bciers/utils/enums";
import { actionHandler } from "@bciers/actions";

export default async function handleAccessRequestStatus(
  userOperatorId: string,
  statusUpdate: Status,
  roleUpdate: UserOperatorRoles,
) {
  try {
    return await actionHandler(
      `registration/user-operators/${userOperatorId}/update-status`,
      "PUT",
      "",
      {
        body: JSON.stringify({
          role: roleUpdate,
          status: statusUpdate,
        }),
      },
    );
  } catch (error) {
    throw error;
  }
}
