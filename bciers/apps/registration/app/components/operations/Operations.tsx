import { GridRowsProp } from "@mui/x-data-grid";

import buildQueryParams from "@/app/utils/buildQueryParams";
import OperationDataGrid from "./OperationDataGrid";
import { FrontEndRoles } from "@/app/utils/enums";
import { OperationRow, OperationsSearchParams } from "./types";
import { actionHandler } from "@/app/utils/actions";

export const formatOperationRows = (rows: GridRowsProp) => {
  if (!rows) {
    return;
  }
  return rows.map(({ id, operator, name, bcghg_id, type }) => {
    return {
      id,
      name,
      bcghg_id,
      operator: operator,
      type,
    };
  });
};

// 🛠️ Function to fetch operations
export const fetchOperationsPageData = async (
  searchParams: OperationsSearchParams,
) => {
  try {
    const queryParams = buildQueryParams(searchParams);
    // fetch data from server
    const pageData = await actionHandler(
      `registration/v2/operations${queryParams}`,
      "GET",
      "",
    );
    return {
      rows: formatOperationRows(pageData.data) as OperationRow[],
      row_count: pageData.row_count,
    };
  } catch (error) {
    throw error;
  }
};

// 🧩 Main component
export default async function Operations({
  searchParams,
  role,
}: {
  searchParams: OperationsSearchParams;
  role: FrontEndRoles;
}) {
  // Fetch operations data
  const operations: {
    rows: OperationRow[];
    row_count: number;
  } = await fetchOperationsPageData(searchParams);
  if (!operations) {
    return <div>No operations data in database.</div>;
  }

  const isAuthorizedAdminUser =
    role?.includes("cas") && !role?.includes("pending");

  // Render the DataGrid component
  return (
    <div className="mt-5">
      <OperationDataGrid
        initialData={operations}
        isInternalUser={isAuthorizedAdminUser}
      />
    </div>
  );
}
