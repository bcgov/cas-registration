import { GridRowsProp } from "@mui/x-data-grid";
import DataGrid from "@/app/components/datagrid/DataGrid";

import { actionHandler } from "@/app/utils/actions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ChangeUserOperatorStatusColumnCell } from "@/app/components/datagrid/ChangeUserOperatorStatusColumnCell";
import { statusStyle } from "@/app/components/datagrid/userPageHelpers";

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
    )
      .flat()
      .filter(
        (userOperator) => !(userOperator.user_id.replace(/-/g, "") === uid),
      );
  }

  const columns = [
    { field: "id", headerName: "User ID", flex: 2 },
    { field: "name", headerName: "Name", flex: 2 },
    { field: "email", headerName: "Email", flex: 6 },
    { field: "business", headerName: "BCeID Business", flex: 6 },
    { field: "userRole", headerName: "User Role", flex: 4 },
    {
      field: "status",
      headerName: "Status",
      flex: 3,
      renderCell: statusStyle,
    },
    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      renderCell: ChangeUserOperatorStatusColumnCell,
      flex: 4,
    },
  ];

  const statusRows: GridRowsProp = userOperatorStatuses.map((uOS) => ({
    id: uOS.user_id,
    name: `${uOS.first_name} ${uOS.last_name.slice(0, 1)}`,
    email: uOS.email,
    business: uOS.business_name,
    userRole: uOS.role,
    status: uOS.status,
    actions: "todo: Approve/Reject func",
  }));

  return (
    <>
      <DataGrid rows={statusRows} columns={columns} cntxt="userOperators" />
    </>
  );
}
