import OperationDataGrid from "./OperationDataGrid";
import { OperationRow, OperationsSearchParams } from "./types";
import fetchOperationsPageData from "./fetchOperationsPageData";
import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonGrid";
import { auth } from "@/dashboard/auth";

// 🧩 Main component
export default async function Operations({
  searchParams,
}: {
  searchParams: OperationsSearchParams;
}) {
  const session = await auth();

  const role = session?.user?.app_role;
  // Fetch operations data
  const operations: {
    rows: OperationRow[];
    row_count: number;
  } = await fetchOperationsPageData(searchParams);
  if (!operations) {
    return <div>No operations data in database.</div>;
  }

  const isAuthorizedAdminUser =
    role?.includes("cas") && !role?.includes("pending");

  // Render the DataGrid component
  return (
    <Suspense fallback={<Loading />}>
      <div className="mt-5">
        <OperationDataGrid
          initialData={operations}
          isInternalUser={isAuthorizedAdminUser}
        />
      </div>
    </Suspense>
  );
}
