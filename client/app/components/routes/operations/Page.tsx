// 🚩 flagging: the shared page route for */operations
import Link from "next/link";
import { Button } from "@mui/material";
import { Suspense } from "react";
import Loading from "@/app/components/loading/SkeletonGrid";
import Note, { registrationRequestNote } from "../../datagrid/Note";
import { GridRowsProp } from "@mui/x-data-grid";

import { actionHandler } from "@/app/utils/actions";
import OperationDataGrid from "@/app/components/operations/OperationDataGrid";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import StatusStyleColumnCell from "../../datagrid/cells/StatusStyleColumnCell";

// 🛠️ Function to fetch operations
async function getOperations() {
  try {
    return await actionHandler(
      // Fetch page one of the operations data on initial load
      "registration/operations",
      "GET",
      "/dashboard/operations",
    );
  } catch (error) {
    // Handle the error here or rethrow it to handle it at a higher level
    throw error;
  }
}
const formatTimestamp = (timestamp: string) => {
  if (!timestamp) return undefined;

  const date = new Date(timestamp).toLocaleString("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "America/Vancouver",
  });

  const timeWithTimeZone = new Date(timestamp).toLocaleString("en-CA", {
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    timeZoneName: "short",
    timeZone: "America/Vancouver",
  });

  // Return with a line break so we can display date and time on separate lines
  // in the DataGrid cell using whiteSpace: "pre-line" CSS
  return `${date}\n${timeWithTimeZone}`;
};

export const formatOperationRows = (rows: GridRowsProp) => {
  return rows.map(
    ({
      id,
      bc_obps_regulated_operation,
      operator,
      submission_date,
      status,
      name,
      bcghg_id,
    }) => {
      return {
        id,
        bc_obps_regulated_operation: bc_obps_regulated_operation ?? "N/A",
        name,
        bcghg_id,
        operator: operator,
        submission_date: formatTimestamp(submission_date) ?? status,
        status,
      };
    },
  );
};

export default async function OperationsPage() {
  // 👤 Use NextAuth.js hook to get information about the user's session
  /* When calling from the server-side i.e., in Route Handlers, React Server Components, API routes,
   * getServerSession requires passing the same object you would pass to NextAuth
   */
  const session = await getServerSession(authOptions);
  const role = session?.user?.app_role;

  const operations: {
    data: {
      id: number;
      bcghg_id: string;
      bc_obps_regulated_operation: string;
      name: string;
      operator: string;
      submission_date: string;
      status: string;
    }[];
    row_count: number;
  } = await getOperations();
  if (!operations) {
    return <div>No operations data in database.</div>;
  }

  const { row_count: rowCount } = operations;
  // Transform the fetched data into rows for the DataGrid component

  const rows = formatOperationRows(operations.data);
  // Show the operator column if the user is CAS internal
  const isOperatorColumn =
    session?.user.app_role?.includes("cas") &&
    !session?.user.app_role?.includes("pending");

  const columns = [
    { field: "bcghg_id", headerName: "BC GHG ID", width: 160 },
    {
      field: "name",
      headerName: "Operation",
      width: isOperatorColumn ? 320 : 560,
    },
    {
      field: "submission_date",
      headerName: "Submission Date",
      width: isOperatorColumn ? 200 : 220,
    },
    {
      field: "bc_obps_regulated_operation",
      headerName: "BORO ID",
      width: isOperatorColumn ? 160 : 220,
    },
    {
      field: "status",
      headerName: "Application Status",
      width: 130,
      renderCell: StatusStyleColumnCell,
    },
    {
      field: "action",
      headerName: "Action",
      sortable: false,
      width: 120,
      // Set flex to 1 to make the column take up all the remaining width if user zooms out
      flex: 1,
    },
  ];

  const operatorColumnIndex = 1;

  if (isOperatorColumn) {
    // Add the operator column if the user is CAS internal
    columns.splice(operatorColumnIndex, 0, {
      field: "operator",
      headerName: "Operator",
      width: 320,
    });
  }

  return (
    <>
      {/* Conditionally render the button based on user's role */}
      {role?.includes("industry_user") && (
        <Link href={"/dashboard/operations/create/1"}>
          <Button variant="contained">Add Operation</Button>
        </Link>
      )}
      {role && role.includes("cas") && (
        <Note classNames="mb-4 mt-6" message={registrationRequestNote} />
      )}
      <Suspense fallback={<Loading />}>
        <div className="mt-5">
          <OperationDataGrid
            rows={rows}
            rowCount={rowCount}
            columns={columns}
          />
        </div>
      </Suspense>
    </>
  );
}
