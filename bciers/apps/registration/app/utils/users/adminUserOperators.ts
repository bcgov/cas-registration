import { Status, UserOperatorStatus } from "@/app/utils/enums";
import { actionHandler, getToken } from "@/app/utils/actions";

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

export async function getExternalDashboardUsersTileData(): Promise<
  ExternalDashboardUsersTile[]
> {
  try {
    return await actionHandler(
      `registration/user-operator/user-operator-list-from-user`,
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

  return transformedTileData;
}
