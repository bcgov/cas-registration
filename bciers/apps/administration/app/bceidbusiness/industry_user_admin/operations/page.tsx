// 🚩 flagging that for shared routes between roles, "Page" code is a component for code maintainability
import {
  OperationRow,
  OperationsSearchParams,
} from "@/administration/app/components/operations/types";
import OperationDataGridPage from "@/administration/app/components/operations/OperationDataGridPage";
import { ExternalUserOperationDataGridLayout } from "@/administration/app/components/operations/OperationLayouts";
import Loading from "@bciers/components/loading/SkeletonGrid";
import { Suspense } from "react";
import { getSessionRole } from "@bciers/utils/src/sessionUtils";
import { fetchOperationsPageData } from "@bciers/actions/api";

export default async function Page({
  searchParams,
}: {
  searchParams: OperationsSearchParams;
}) {
  const role = await getSessionRole();
  const isInternalUser = role.includes("cas_");

  // IRC users should only see Registered operations
  const filteredSearchParams = isInternalUser
    ? { ...searchParams, operation__status: "Registered" }
    : searchParams;

  // Fetch operations data
  const operations: {
    rows: OperationRow[];
    row_count: number;
  } = await fetchOperationsPageData(filteredSearchParams);
  if (!operations || "error" in operations)
    throw new Error("Failed to retrieve operations");
  const operationsWithoutContacts = operations.rows // this filter lists operations that are Registered but have no contacts(reps) assigned
    .filter(
      (operation) =>
        operation.operation__status == "Registered" &&
        (!operation.operation__contact_ids ||
          (operation.operation__contact_ids.length === 1 &&
            operation.operation__contact_ids[0] === null)),
    )
    .map((operation) => operation.operation__name);

  return (
    <ExternalUserOperationDataGridLayout
      operationsWithoutContacts={operationsWithoutContacts}
    >
      <Suspense fallback={<Loading />}>
        <OperationDataGridPage
          filteredSearchParams={filteredSearchParams}
          isInternalUser={isInternalUser}
          initialData={operations}
        />
      </Suspense>
    </ExternalUserOperationDataGridLayout>
  );
}
