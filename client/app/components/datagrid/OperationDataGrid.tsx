"use client";

import DataGrid from "./DataGrid";
import Link from "next/link";
import { GridRenderCellParams } from "@mui/x-data-grid";
import { actionHandler } from "@/app/utils/actions";
import { formatOperationRows } from "@/app/components/routes/operations/Operations";
import { useSession } from "next-auth/react";

const fetchOperationPageData = async (
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
    return formatOperationRows(pageData.data);
  } catch (error) {
    throw error;
  }
};

const OperationDataGrid = ({
  rows,
  rowCount,
  columns,
}: {
  rows: any[];
  columns: any[];
  rowCount: number;
}) => {
  const { data: session } = useSession();

  const isIndustryUser = session?.user.app_role?.includes("industry");

  const updatedColumnsOperations = columns.map((column) => {
    if (column.field === "action") {
      return {
        ...column,
        renderCell: (params: GridRenderCellParams) => (
          <div>
            {/* 🔗 Add reg or details link */}
            <Link
              className="no-underline text-bc-link-blue whitespace-normal"
              href={`operations/${params.row.id}${isIndustryUser ? "/1" : ""}`}
            >
              {params.row.status === "Not Started"
                ? "Start Application"
                : "View Details"}
            </Link>
          </div>
        ),
      };
    }
    return column;
  });

  return (
    <DataGrid
      columns={updatedColumnsOperations}
      fetchPageData={fetchOperationPageData}
      paginationMode="server"
      rows={rows}
      rowCount={rowCount}
    />
  );
};

export default OperationDataGrid;
