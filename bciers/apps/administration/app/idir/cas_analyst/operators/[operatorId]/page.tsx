// 🚩 flagging that for shared routes between roles, "Page" code is a component for code maintainability
import { OperatorsSearchParams } from "@/administration/app/components/operators/types";
import OperatorDataGridPage from "@/administration/app/components/operators/OperatorDataGridPage";
import { InternalOperatorDataGridLayout } from "@/administration/app/components/operators/OperatorLayouts";
import Loading from "@bciers/components/loading/SkeletonGrid";
import { Suspense } from "react";

export default async function Page({
  searchParams,
}: {
  searchParams: OperatorsSearchParams;
}) {
  return (
    <InternalOperatorDataGridLayout>
      <Suspense fallback={<Loading />}>
        <OperatorDataGridPage searchParams={searchParams} />
      </Suspense>
    </InternalOperatorDataGridLayout>
  );
}
