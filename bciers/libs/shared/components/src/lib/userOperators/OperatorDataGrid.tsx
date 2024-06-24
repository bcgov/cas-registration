"use client";

import Link from "next/link";
import { GridRenderCellParams } from "@mui/x-data-grid";

import DataGrid from "@bciers/components/datagrid/DataGrid";
import { fetchUserOperatorPageData } from "@/registration/app/components/operators/OperatorsPage";

import { UserOperator } from "./types";

const OperatorDataGrid = ({
  initialData,
  columns,
}: {
  initialData: {
    rows: UserOperator[];
    row_count: number;
  };
  columns: any[];
}) => {
  const updatedColumnsUserOperators = columns.map((column) => {
    if (column.field === "action") {
      return {
        ...column,
        renderCell: (params: GridRenderCellParams) => (
          <div>
            {/* 🔗 Add link with href query parameter with row's descriptive text*/}
            {/* Link to the first page of the multistep form for a specific user-operator. The '1' represents the first formSection of the form. */}
            <Link
              className="no-underline text-bc-link-blue"
              href={{
                pathname: `operators/user-operator/${params.row.id}/1`,
                query: {
                  title: `${params.row.legal_name}`,
                },
              }}
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
      initialData={initialData}
    />
  );
};

export default OperatorDataGrid;
