"use client";

import { GridColDef } from "@mui/x-data-grid";
import annualReportsColumns from "@reporting/src/app/components/datagrid/models/annualReports/annualReportsColumns";

const pastReportsColumns = (): GridColDef[] => {
  const baseColumns = annualReportsColumns();
  // Add the reporting_year field at the start
  const columns: GridColDef[] = [
    { field: "reporting_year", headerName: "Reporting Year", width: 150 },
    ...baseColumns,
  ];
  return columns;
};

export default pastReportsColumns;
