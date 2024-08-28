import { OperatorRow, OperatorsSearchParams } from "./types";
import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonGrid";
import { auth } from "@/dashboard/auth";
import OperatorDataGrid from "./OperatorDataGrid";
import fetchOperatorsPageData from "./fetchOperatorsPageData";

// 🧩 Main component
export default async function Operators({
  searchParams,
}: {
  searchParams: OperatorsSearchParams;
}) {
  const session = await auth();

  const role = session?.user?.app_role;
  // Fetch operations data
  const operators: {
    rows: OperatorRow[];
    row_count: number;
  } = await fetchOperatorsPageData(searchParams);
  if (!operators) {
    return <div>No user operator data in database.</div>;
  }

  const isAuthorizedAdminUser =
    role?.includes("cas") && !role?.includes("pending");

  // Render the DataGrid component
  return (
    <Suspense fallback={<Loading />}>
      <div className="mt-5">
        <OperatorDataGrid
          initialData={operators}
          isInternalUser={isAuthorizedAdminUser}
        />
      </div>
    </Suspense>
  );
}
