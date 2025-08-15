"use client";

import { GridColDef } from "@mui/x-data-grid";
import dashboardColumns from "@reporting/src/app/components/datagrid/models/dashboard/dashboardColumns";

const pastReportsColumns = (): GridColDef[] => {
  const baseColumns = dashboardColumns();
  // Add the reporting_year field at the start
  const columns: GridColDef[] = [
    { field: "reporting_year", headerName: "Reporting Year", width: 150 },
    ...baseColumns,
  ];
  return columns;
};

export default pastReportsColumns;
