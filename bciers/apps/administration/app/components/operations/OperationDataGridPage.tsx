import OperationDataGrid from "./OperationDataGrid";
import { OperationRow, OperationsSearchParams } from "./types";
import fetchOperationsPageData from "./fetchOperationsPageData";
import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonGrid";
import { auth } from "@/dashboard/auth";
import { FrontEndRoles } from "@bciers/utils/enums";

// 🧩 Main component
export default async function OperationDataGridPage({
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

  const isAuthorizedAdminUser = [
    FrontEndRoles.CAS_ADMIN,
    FrontEndRoles.CAS_ANALYST,
  ].includes(role as FrontEndRoles);

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
