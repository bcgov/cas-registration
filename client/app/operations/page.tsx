"use client";

import { GridRowsProp, GridColDef } from "@mui/x-data-grid";
import DataGrid from "../components/DataGrid/DataGrid";
import Link from "next/link";
import { Button } from "@mui/material";
import { useGetOperationsQuery } from "@/redux/index";

export const columns: GridColDef[] = [
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
          <Button variant="contained">
            {params.row.status === "Not Registered"
              ? "Start Registration"
              : "View Details"}
          </Button>
        </Link>
      );
    },
  },
];

export default function Page() {
  const { data, isLoading, error } = useGetOperationsQuery(null);

  // Check if data is currently loading
  if (isLoading) {
    return <div>🚀 Loading data... </div>;
  }

  // Check if an error occurred
  if (error) {
    return <div>Something went wrong, Please retry after some time</div>;
  }

  if (!data) {
    return (
      <div>
        No operations data in database (did you forget to run `make
        loadfixtures`?)
      </div>
    );
  }

  const rows: GridRowsProp = data.map(
    ({
      id,
      registration_year,
      submission_date,
      registration_id,
      verified_at,
      name,
    }) => {
      return {
        id,
        name,
        operation_id: id,
        registration_year,
        submission_date,
        registration_id,
        status: verified_at ? "Registered" : "Pending",
      };
    }
  );

  return (
    <>
      <h1>Operations List</h1>
      <Link href="/operations/create">
        <Button variant="contained">Add Operation</Button>
      </Link>
      <DataGrid columns={columns} rows={rows} />
    </>
  );
}
