import { Status, UserOperatorRoles } from "@bciers/utils/src/enums";
import { actionHandler } from "@bciers/actions";

export default async function handleAccessRequestStatus(
  userOperatorId: string,
  statusUpdate: Status,
  roleUpdate: UserOperatorRoles,
) {
  const endpoint = `registration/user-operators/${userOperatorId}/status`;
  const pathToRevalidate = "/users-and-access-requests";
  const response = await actionHandler(endpoint, "PATCH", pathToRevalidate, {
    body: JSON.stringify({
      role: roleUpdate,
      status: statusUpdate,
    }),
  });
  return response;
}
