import { GridRowsProp, GridColDef } from "@mui/x-data-grid";
import DataGrid from "../components/DataGrid/DataGrid";
import Link from "next/link";
import { Button } from "@mui/material";
import { Suspense } from "react";
import OperatorsGrid from "../components/DataGrid/OperatorsGrid";

export async function getOperations() {
  return (
    await fetch("http://localhost:8000/api/registration/operations", {
      cache: "no-store",
    })
  ).json();
}

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
        <OperatorsGrid rows={rows} />
      </Suspense>
    </>
  );
}
