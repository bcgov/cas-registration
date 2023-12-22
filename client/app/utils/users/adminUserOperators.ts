import { Status } from "@/app/utils/enums";
import { actionHandler, getToken } from "@/app/utils/actions";

export interface UserOperatorStatus {
  user_id: string;
  first_name: string;
  last_name: string;
  position_title: string;
  business_name: string;
  email: string;
  role: string;
  status: string | Status;
}

type UserOperator = {
  operator: string;
};

// 🛠️ Function to fetch a user's approved UserOperators, returning the business id as `obj.operator`
async function getAdminsApprovedUserOperators(): Promise<UserOperator[]> {
  try {
    return await actionHandler(
      `registration/get-current-users-operators`,
      "GET",
      "/dashboard/users"
    );
  } catch (error) {
    throw error;
  }
}

// 🛠️ Function to fetch userOperators
async function getUserOperatorsForOperator(
  operator_id: string
): Promise<UserOperatorStatus[]> {
  try {
    return await actionHandler(
      `registration/operators/${operator_id}/user-operators`,
      "GET",
      "/dashboard/users"
    );
  } catch (error) {
    throw error;
  }
}

// 🛠️ Function to fetch approved operators for admins, processes the associated user operators, and updates their statuses.
export async function processAdminUserOperators(): Promise<
  UserOperatorStatus[]
> {
  let userOperatorStatuses: UserOperatorStatus[] = [];
  const approvedOperators = await getAdminsApprovedUserOperators();
  if (approvedOperators) {
    const token = await getToken();
    const uid = token?.user_guid ?? "";
    userOperatorStatuses = (
      await Promise.all(
        approvedOperators.flatMap((associatedOperator) =>
          getUserOperatorsForOperator(associatedOperator.operator)
        )
      )
    )
      .flat()
      .map((uo) => {
        uo.status = uo.status
          ? Status[uo.status.toUpperCase() as keyof typeof Status]
          : Status.DRAFT;
        return uo;
      });

    // 🤳Identify current admin user in the list
    const selfIndex = userOperatorStatuses.findIndex(
      (userOperator) => userOperator.user_id.replace(/-/g, "") === uid
    );
    userOperatorStatuses[selfIndex].status = Status.MYSELF;
  }
  return userOperatorStatuses;
}
