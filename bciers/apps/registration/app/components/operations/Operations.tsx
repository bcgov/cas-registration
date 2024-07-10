import OperationsWithFacilitiesDataGrid from "./OperationsWithFacilitiesDataGrid";
import { OperationRow, OperationsSearchParams } from "./types";
import fetchOperationsPageData from "./fetchOperationsPageData";
import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonGrid";
import Link from "next/link";
import Note from "@bciers/components/layout/Note";
import { Button } from "@mui/material";

export const InternalUserLayout = () => {
  return (
    <>
      <Note>
        <b>Note:</b> View all the operations, which can be sorted or filtered by
        operator here.
      </Note>
      <h1>Operations</h1>
    </>
  );
};

export const ExternalUserLayout = () => {
  return (
    <>
      <Note>
        <b>Note:</b> View the operations owned by your operator here.
      </Note>
      <h1>Operations</h1>
      <Link href={"/dashboard/operations/create/1"}>
        <Button variant="contained">Add Operation</Button>
      </Link>
    </>
  );
};

// 🧩 Main component
export default async function Operations({
  searchParams,
  isInternalUser,
}: {
  searchParams: OperationsSearchParams;
  isInternalUser: boolean;
}) {
  // Fetch operations data
  const operations: {
    rows: OperationRow[];
    row_count: number;
  } = await fetchOperationsPageData(searchParams);
  if (!operations) {
    return <div>No operations data in database.</div>;
  }

  // Render the DataGrid component
  return (
    <Suspense fallback={<Loading />}>
      <div className="mt-5">
        <OperationsWithFacilitiesDataGrid
          initialData={operations}
          isInternalUser={isInternalUser}
        />
      </div>
    </Suspense>
  );
}
