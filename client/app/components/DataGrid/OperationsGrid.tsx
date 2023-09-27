"use client";
import * as React from "react";
import { GridRowsProp, GridColDef } from "@mui/x-data-grid";
import Link from "next/link";
import { Button } from "@mui/material";
import DataGrid from "./DataGrid";

// Can't pass functions from server components to client ones, so needed to create this client component to pass the columns array. The rows array doesn't contain functions, so that can be passed in the operations page server component.
const columns: GridColDef[] = [
  { field: "operation_id", headerName: "Operation ID", width: 150 },
  { field: "name", headerName: "Operation", width: 150 },
  { field: "registration_year", headerName: "Registration Year", width: 150 },
  { field: "submission_date", headerName: "Submission Date", width: 150 },
  { field: "registration_id", headerName: "Registration ID", width: 150 },
  { field: "status", headerName: "Status", width: 150 },
  {
    field: "action",
    headerName: "Action",
    sortable: false,
    width: 200,
    renderCell: (params) => {
      return (
        <Link href={`operations/${params.row.id}`}>
          <Button
            className={`bg-[#003366] text-white text-sm font-semibold px-4 py-2 rounded`}
          >
            {params.row.status === "Not Registered"
              ? "Start Registration"
              : "View Details"}
          </Button>
        </Link>
      );
    },
  },
];

interface Props {
  rows: GridRowsProp;
}

const OperationsGrid: React.FunctionComponent<Props> = ({ rows }) => {
  return (
    <div style={{ height: "auto", width: "90%" }}>
      <DataGrid rows={rows} columns={columns} />
    </div>
  );
};
export default OperationsGrid;
