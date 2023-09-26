import { GridRowsProp, GridColDef } from "@mui/x-data-grid";
import DataGrid from "../components/DataGrid/DataGrid";
import Link from "next/link";
import { Button } from "@mui/material";
import { Suspense } from "react";

export async function getOperations() {
  return (
    await fetch("http://localhost:8000/api/registration/operations")
  ).json();
}

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
    // brianna figure out
    // renderCell: (params) => {
    //   return (
    //     <Link href={`operations/${params.row.id}`}>
    //       <Button variant="contained">
    //         {params.row.status === "Not Registered"
    //           ? "Start Registration"
    //           : "View Details"}
    //       </Button>
    //     </Link>
    //   );
    // },
  },
];

export default async function Page() {
  const operations = await getOperations();

  if (!operations) {
    return (
      <div>
        No operations data in database (did you forget to run `make
        loadfixtures`?)
      </div>
    );
  }

  const rows: GridRowsProp = operations.map(
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
      <Suspense fallback={<p>🚀 Loading data...</p>}>
        <Link href="/operations/create">
          <Button variant="contained">Add Operation</Button>
        </Link>
        <DataGrid columns={columns} rows={rows} />
      </Suspense>
    </>
  );
}
