"use client";

import DataGrid from "./DataGrid";
import { actionHandler } from "@/app/utils/actions";
import Link from "next/link";
import { GridRenderCellParams } from "@mui/x-data-grid";
import { formatUserOperatorRows } from "@/app/components/routes/access-requests/AccessRequests";

const fetchUserOperatorPageData = async (
  page: number,
  sortField?: string,
  sortDirection?: string,
) => {
  try {
    // fetch data from server
    const pageData = await actionHandler(
      `registration/user-operators?page=${page}&sort_field=${sortField}&sort_direction=${sortDirection}`,
      "GET",
      "",
    );
    return formatUserOperatorRows(pageData.data);
  } catch (error) {
    throw error;
  }
};

const OperatorDataGrid = ({
  rows,
  rowCount,
  columns,
}: {
  rows: any[];
  rowCount: number;
  columns: any[];
}) => {
  const updatedColumnsUserOperators = columns.map((column) => {
    if (column.field === "action") {
      return {
        ...column,
        renderCell: (params: GridRenderCellParams) => (
          <div>
            {/* Link to the first page of the multistep form for a specific user-operator. The '1' represents the first formSection of the form. */}
            <Link
              className="no-underline text-bc-link-blue"
              href={`operators/user-operator/${params.row.id}/1`}
            >
              View Details
            </Link>
          </div>
        ),
      };
    }
    return column;
  });

  return (
    <DataGrid
      columns={updatedColumnsUserOperators}
      fetchPageData={fetchUserOperatorPageData}
      paginationMode="server"
      rows={rows}
      rowCount={rowCount}
    />
  );
};

export default OperatorDataGrid;
