"use client";

import { GridColDef } from "@mui/x-data-grid";
import dashboardColumns from "@reporting/src/app/components/datagrid/models/dashboard/dashboardColumns";

export const OPERATOR_COLUMN_INDEX = 1;

const operationColumns = (): GridColDef[] => {
  const baseColumns = dashboardColumns();
  // Add the bcghg_id field at the start
  const columns: GridColDef[] = [
    { field: "bcghg_id", headerName: "BC GHG ID", width: 160 },
    ...baseColumns,
  ];

  return columns;
};

export default operationColumns;
