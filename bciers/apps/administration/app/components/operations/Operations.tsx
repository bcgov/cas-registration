import OperationDataGrid from "./OperationDataGrid";
import { OperationRow, OperationsSearchParams } from "./types";
import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonGrid";
import fetchOperationsPageData from "./fetchOperationsPageData";
import Note from "@bciers/components/layout/Note";
import Link from "next/link";
import { Button } from "@mui/material";

export const InternalUserOperationsLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <>
    <Note>
      <b>Note: </b>View all the operations, which can be sorted or filtered by
      operator here.
    </Note>
    <h2 className="text-bc-primary-blue">Operations</h2>
    {children}
  </>
);

export const ExternalUserOperationsLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <>
    <Note>
      <b>Note: </b>View the operations owned by your operator here.
    </Note>
    <h2 className="text-bc-primary-blue">Operations</h2>
    <div className="text-right">
      <Link href={"/dashboard/operations/create/1"}>
        <Button variant="contained">Add Operation</Button>
      </Link>
    </div>
    {children}
  </>
);

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
        <OperationDataGrid
          initialData={operations}
          isInternalUser={isInternalUser}
        />
      </div>
    </Suspense>
  );
}
