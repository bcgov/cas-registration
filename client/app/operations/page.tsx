export const runtime = "edge"; // 'nodejs' (default) | 'edge'
import { GridRowsProp } from "@mui/x-data-grid";
import Link from "next/link";
import { Button } from "@mui/material";
import { Suspense } from "react";
import DataGrid from "../components/datagrid/DataGrid";
import Loading from "../components/loading";

export async function getOperations() {
  return (
    await fetch("http://localhost:8000/api/registration/operations", {
      cache: "no-store",
    })
  ).json();
}

export default async function Page() {
  const operations: {
    id: number;
    registration_year: string;
    submission_date: string;
    registration_id: string;
    verified_at: string;
    name: string;
  }[] = await getOperations();

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
    },
  );

  return (
    <>
      <h1>Operations List</h1>
      <Suspense fallback={<Loading />}>
        <Link href="/operations/create">
          <Button variant="contained">Add Operation</Button>
        </Link>
        <DataGrid
          cntxt="operations"
          rows={rows}
          columns={[
            { field: "operation_id", headerName: "Operation ID", width: 150 },
            { field: "name", headerName: "Operation", width: 150 },
            {
              field: "registration_year",
              headerName: "Registration Year",
              width: 150,
            },
            {
              field: "submission_date",
              headerName: "Submission Date",
              width: 150,
            },
            {
              field: "registration_id",
              headerName: "Registration ID",
              width: 150,
            },
            { field: "status", headerName: "Status", width: 150 },
            {
              field: "action",
              headerName: "Action",
              sortable: false,
              width: 200,
            },
          ]}
        />
      </Suspense>
    </>
  );
}
