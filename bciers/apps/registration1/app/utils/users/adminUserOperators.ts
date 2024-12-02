import { Status, UserOperatorStatus } from "@bciers/utils/src/enums";
import { actionHandler, getToken } from "@bciers/actions";
import { OperatorStatus, UserOperatorRoles } from "@bciers/utils/src/enums";

export interface ExternalDashboardUsersTile {
  user: { [key: string]: any };
  operator: { [key: string]: any };
  first_name: string;
  last_name: string;
  position_title: string;
  business_name: string;
  email: string;
  role: string;
  status: string | Status;
  id: string;
}

export interface UserOperatorDataGridRow {
  id: string;
  name: string;
  email: string;
  business: string;
  accessType: string;
  status: string | Status;
}

export async function getExternalDashboardUsersTileData(): Promise<
  ExternalDashboardUsersTile[]
> {
  try {
    return await actionHandler(
      `registration/v1/user-operators/current/access-requests`,
      "GET",
      "/dashboard/users",
    );
  } catch (error) {
    throw error;
  }
}
export async function processExternalDashboardUsersTileData() {
  const tileData = await getExternalDashboardUsersTileData();

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
    const { id, role, status, user, operator } = uOS;

    // If the user is pending, we want to default the access type dropdown to Reporter
    const accessType =
      role === UserOperatorRoles.PENDING ? UserOperatorRoles.REPORTER : role;

    return {
      id: id, // This unique ID is needed for DataGrid to work properly
      name: `${user.first_name} ${user.last_name}`,
      email: user.email,
      business: operator.legal_name,
      accessType: status === OperatorStatus.DECLINED ? "N/A" : accessType,
      status: status,
    };
  });

  return {
    rows: rowData as UserOperatorDataGridRow[],
  };
}
