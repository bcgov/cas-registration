import { GridRowsProp } from "@mui/x-data-grid";
import Link from "next/link";
import { Button } from "@mui/material";
import { Suspense } from "react";
import OperationsGrid from "../components/DataGrid/OperationsGrid";
import Loading from "../components/loading";

export const dynamic = "force-dynamic";
export async function getOperations() {
  return (
    await fetch("http://localhost:8000/api/registration/operations", {})
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
        <OperationsGrid rows={rows} />
      </Suspense>
    </>
  );
}
