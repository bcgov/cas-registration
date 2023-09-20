"use client";

import { Button } from "@button-inc/bcgov-theme";
import { GridRowsProp, GridColProp, GridColDef } from "@mui/x-data-grid";
import DataGrid from "../components/DataGrid/DataGrid";

export const rows: GridRowsProp = [
  { id: 1, col1: "Hello", col2: "World" },
  {
    id: 2,
    operationId: "DataGridPro",
    operation: "is Awesome",
    status: "not registered",
  },
  { id: 3, operationId: "MUI", operation: "is Amazing" },
];

export const columns: GridColDef[] = [
  { field: "operationId", headerName: "Operation ID", width: 150 },
  { field: "operation", headerName: "Operation", width: 150 },
  { field: "registrationYear", headerName: "Registration Year", width: 150 },
  { field: "submissionDate", headerName: "Submission Date", width: 150 },
  { field: "registrationId", headerName: "Registration ID", width: 150 },
  { field: "status", headerName: "Status", width: 150 },
  {
    field: "action",
    headerName: "Action",
    sortable: false,
    width: 200,
    renderCell: (params) => {
      const onClick = (e) => {
        console.log("params", params.row.status);
        return alert("this will eventually take you somewhere");
      };

      return (
        <Button onClick={onClick}>
          {params.row.status === "Not Registered"
            ? "Start Registration"
            : "View Details"}
        </Button>
      );
    },
  },
];

export default function Page() {
  return (
    <>
      <h1>Operations</h1>
      <DataGrid columns={columns} rows={rows} />
    </>
  );
}
