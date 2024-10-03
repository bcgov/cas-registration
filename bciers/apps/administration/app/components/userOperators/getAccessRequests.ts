import {
  Status,
  UserOperatorStatus,
  OperatorStatus,
  UserOperatorRoles,
} from "@bciers/utils/enums";
import { actionHandler, getToken } from "@bciers/actions";
import {
  AccessRequest,
  UserOperatorDataGridRow,
} from "@/administration/app/components/userOperators/types";

export async function getAccessRequests(): Promise<AccessRequest[]> {
  try {
    return await actionHandler(
      `registration/user-operators/current/access-requests`,
      "GET",
      "/dashboard/users",
    );
  } catch (error) {
    throw error;
  }
}
export async function processAccessRequestData() {
  const tileData = await getAccessRequests();

  // Ensure tileData is an array before using map
  const transformedTileData = Array.isArray(tileData)
    ? tileData.map((userOperator) => {
        userOperator.status = userOperator.status
          ? UserOperatorStatus[
              userOperator.status.toUpperCase() as keyof typeof UserOperatorStatus
            ]
          : UserOperatorStatus.PENDING;

        return userOperator;
      })
    : [];

  // 🤳Identify current admin user in the list
  const token = await getToken();
  const uid = token?.user_guid ?? "";
  const selfIndex = transformedTileData.findIndex((userOperator) => {
    return userOperator.user.user_guid.replace(/-/g, "") === uid;
  });

  // Ensure selfIndex is within the valid range before modifying the array
  if (selfIndex !== -1 && selfIndex < transformedTileData.length) {
    transformedTileData[selfIndex].status = Status.MYSELF;
  }
  const rowData = transformedTileData.map((uOS) => {
    const { id, user_friendly_id, role, status, user, operator } = uOS;

    // If the user is pending, we want to default the access type dropdown to Reporter
    const userRole =
      role === UserOperatorRoles.PENDING ? UserOperatorRoles.REPORTER : role;

    return {
      id: id, // This unique ID is needed for DataGrid to work properly
      userFriendlyId: user_friendly_id,
      name: `${user.first_name} ${user.last_name}`,
      email: user.email,
      business: operator.legal_name,
      userRole: status === OperatorStatus.DECLINED ? "N/A" : userRole,
      status: status,
    };
  });

  return {
    rows: rowData as UserOperatorDataGridRow[],
  };
}
