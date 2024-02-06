"use client";

import DataGrid from "./DataGrid";
import Link from "next/link";
import { GridRenderCellParams } from "@mui/x-data-grid";

const OperatorDataGrid = ({
  rows,
  columns,
}: {
  rows: any[];
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

  return <DataGrid rows={rows} columns={updatedColumnsUserOperators} />;
};

export default OperatorDataGrid;
