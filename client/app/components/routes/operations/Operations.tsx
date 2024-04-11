import { GridRowsProp } from "@mui/x-data-grid";

import { actionHandler } from "@/app/utils/actions";
import OperationDataGrid from "@/app/components/datagrid/OperationDataGrid";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { OperationsSearchParams } from "@/app/components/routes/operations/types";

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

// 🛠️ Function to fetch operations
export const fetchOperationsPageData = async (
  page: number,
  sortField?: string,
  sortOrder?: string,
) => {
  try {
    // fetch data from server
    const pageData = await actionHandler(
      `registration/operations?page=${page}&sort_field=${sortField}&sort_order=${sortOrder}`,
      "GET",
      "",
    );
    return {
      rows: formatOperationRows(pageData.data),
      row_count: pageData.row_count,
    };
  } catch (error) {
    throw error;
  }
};

// 🧩 Main component
export default async function Operations({
  searchParams,
}: {
  searchParams: OperationsSearchParams;
}) {
  const session = await getServerSession(authOptions);
  const sortField = searchParams?.sort_field ?? "created_at";
  const sortOrder = searchParams?.sort_order ?? "desc";
  // Fetch operations data
  const operations: {
    rows: {
      id: number;
      bcghg_id: string;
      bc_obps_regulated_operation: string;
      name: string;
      operator: string;
      submission_date: string;
      status: string;
    }[];
    row_count: number;
  } = await fetchOperationsPageData(1, sortField, sortOrder);
  if (!operations) {
    return <div>No operations data in database.</div>;
  }

  // Show the operator column if the user is CAS internal
  const isOperatorColumn =
    session?.user.app_role?.includes("cas") &&
    !session?.user.app_role?.includes("pending");

  // Render the DataGrid component
  return (
    <div className="mt-5">
      <OperationDataGrid
        initialData={operations}
        isOperatorColumn={isOperatorColumn}
      />
    </div>
  );
}
