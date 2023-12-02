import { actionHandler } from "@/app/utils/actions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

type BusinessUserOperator = {
  operator: string;
};

interface UserOperatorStatus {
  user_id: string;
  first_name: string;
  last_name: string;
  position_title: string;
  business_name: string;
  email: string;
  role: string;
  status: string;
}

// 🛠️ Function to fetch userOperators
async function getUserOperatorsForOperator(
  operator_id: string,
): Promise<UserOperatorStatus[]> {
  try {
    return await actionHandler(
      `registration/operators/${operator_id}/user-operators`,
      "GET",
      "/dashboard/users",
    );
  } catch (error) {
    throw error;
  }
}

// 🛠️ Function to fetch a user's approved UserOperators, returning the business id as `obj.operator`
async function getAdminsApprovedUserOperators(
  user_guid: string,
): Promise<BusinessUserOperator[]> {
  try {
    return await actionHandler(
      `registration/get-users-operators/${user_guid}`,
      "GET",
      "/dashboard/users",
    );
  } catch (error) {
    throw error;
  }
}

export default async function Page() {
  const session = await getServerSession(authOptions);
  let userOperatorStatuses: UserOperatorStatus[] = [];

  if (session?.user.user_guid) {
    const uid = session.user.user_guid;
    const approvedOperator = await getAdminsApprovedUserOperators(uid);
    userOperatorStatuses = (
      await Promise.all(
        approvedOperator.flatMap((associatedOperator) =>
          getUserOperatorsForOperator(associatedOperator.operator),
        ),
      )
    ).flat();
  }

  return (
    <>
      <h1>TO DO: Users Page</h1>
      <pre>
        {userOperatorStatuses && JSON.stringify(userOperatorStatuses, null, 2)}
      </pre>
    </>
  );
}
