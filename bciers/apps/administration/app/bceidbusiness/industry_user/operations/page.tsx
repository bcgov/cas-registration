// 🚩 flagging that for shared routes between roles, "Page" code is a component for code maintainability
import { OperationsSearchParams } from "@/administration/app/components/operations/types";
import OperationDataGridPage from "@/administration/app/components/operations/OperationDataGridPage";
import { ExternalUserOperationDataGridLayout } from "@/administration/app/components/operations/OperationLayouts";
import Loading from "@bciers/components/loading/SkeletonGrid";
import { Suspense } from "react";

export default async function Page({
  searchParams,
}: {
  searchParams: OperationsSearchParams;
}) {
  return (
    <ExternalUserOperationDataGridLayout>
      <Suspense fallback={<Loading />}>
        <OperationDataGridPage searchParams={searchParams} />
      </Suspense>
    </ExternalUserOperationDataGridLayout>
  );
}
