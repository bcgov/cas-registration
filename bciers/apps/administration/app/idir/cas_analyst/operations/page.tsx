// 🚩 flagging that for shared routes between roles, "Page" code is a component for code maintainability
import { OperationsSearchParams } from "@/administration/app/components/operations/types";
import { InternalUserOperationDataGridLayout } from "@/administration/app/components/operations/OperationLayouts";
import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonGrid";
import OperationDataGridPage from "@/administration/app/components/operations/OperationDataGridPage";

export default async function Page({
  searchParams,
}: {
  searchParams: OperationsSearchParams;
}) {
  return (
    <InternalUserOperationDataGridLayout>
      <Suspense fallback={<Loading />}>
        <OperationDataGridPage searchParams={searchParams} />
      </Suspense>
    </InternalUserOperationDataGridLayout>
  );
}
