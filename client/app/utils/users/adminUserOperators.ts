import { Status } from "@/app/utils/enums";
import { actionHandler, getToken } from "@/app/utils/actions";

export interface ExternalDashboardUsersTile {
  user: { [key: string]: any };
  operator: { [key: string]: any };

export interface UserOperatorStatus {
  user_id: string;
  id?: number;
  first_name: string;
  last_name: string;
  position_title: string;
  business_name: string;
  email: string;
  role: string;
  status: string | Status;
}

export async function getExternalDashboardUsersTileData(): Promise<
  ExternalDashboardUsersTile[]
> {
  try {
    return await actionHandler(
      `registration/user-operator-list-from-user`,
      "GET",
      "/dashboard/users",
    );
  } catch (error) {
    throw error;
  }
}

export async function processExternalDashboardUsersTileData() {
  const tileData = await getExternalDashboardUsersTileData();

  const transformedTileData = tileData.map((userOperator) => {
    userOperator.status = userOperator.status
      ? Status[userOperator.status.toUpperCase() as keyof typeof Status]
      : Status.DRAFT;

    return userOperator;
  });

  // 🤳Identify current admin user in the list
  const token = await getToken();
  const uid = token?.user_guid ?? "";
  const selfIndex = transformedTileData.findIndex((userOperator) => {
    return userOperator.user.user_guid.replace(/-/g, "") === uid;
  });
  transformedTileData[selfIndex].status = Status.MYSELF;

  return transformedTileData;
}
