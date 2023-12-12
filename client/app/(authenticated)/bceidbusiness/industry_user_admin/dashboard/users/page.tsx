import { GridColDef, GridRowsProp } from "@mui/x-data-grid";
import DataGrid from "@/app/components/datagrid/DataGrid";

import { actionHandler } from "@/app/utils/actions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ChangeUserOperatorStatusColumnCell } from "@/app/components/datagrid/ChangeUserOperatorStatusColumnCell";
import { statusStyle } from "@/app/components/datagrid/userPageHelpers";
import { Status } from "@/app/types/types";

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
  status: string | Status;
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

const statusStringToEnum = (status: string): Status => {
  switch (status.toUpperCase()) {
    case "MYSELF":
      return Status.MYSELF;
      break;
    case "APPROVED":
      return Status.APPROVED;
      break;
    case "REJECTED":
      return Status.REJECTED;
      break;
    case "PENDING":
      return Status.PENDING;
      break;
    case "DRAFT":
    default:
      return Status.DRAFT;
  }
};

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
      .map((uo) => {
        uo.status = statusStringToEnum(uo.status);
        return uo;
      });

    // 🤳Identify current admin user in the list
    const selfIndex = userOperatorStatuses.findIndex(
      (userOperator) => userOperator.user_id.replace(/-/g, "") === uid,
    );
    userOperatorStatuses[selfIndex].status = Status.MYSELF;
  }

  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: "User ID",
      flex: 2,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "name",
      headerName: "Name",
      flex: 2,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "email",
      headerName: "Email",
      flex: 6,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "business",
      headerName: "BCeID Business",
      flex: 6,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "userRole",
      headerName: "User Role",
      flex: 4,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "status",
      headerName: "Status",
      flex: 3,
      renderCell: statusStyle,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      renderCell: ChangeUserOperatorStatusColumnCell,
      flex: 6,
      align: "center",
      headerAlign: "center",
    },
  ];

  const statusRows: GridRowsProp = userOperatorStatuses.map((uOS) => ({
    id: uOS.user_id,
    name: `${uOS.first_name} ${uOS.last_name.slice(0, 1)}`,
    email: uOS.email,
    business: uOS.business_name,
    userRole: uOS.role,
    status: uOS.status,
  }));

  return (
    <>
      <DataGrid rows={statusRows} columns={columns} cntxt="userOperators" />
    </>
  );
}
