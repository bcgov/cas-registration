"use client";

import DataGrid from "./DataGrid";
import Link from "next/link";
import { GridRenderCellParams } from "@mui/x-data-grid";

const OperationDataGrid = ({
  rows,
  columns,
}: {
  rows: any[];
  columns: any[];
}) => {
  const updatedColumnsOperations = columns.map((column) => {
    if (column.field === "action") {
      return {
        ...column,
        renderCell: (params: GridRenderCellParams) => (
          <div>
            {/* 🔗 Add reg or details link */}
            <Link
              className="no-underline text-bc-link-blue whitespace-normal"
              href={`operations/${params.row.id}/1`}
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

  return <DataGrid rows={rows} columns={updatedColumnsOperations} />;
};

export default OperationDataGrid;
