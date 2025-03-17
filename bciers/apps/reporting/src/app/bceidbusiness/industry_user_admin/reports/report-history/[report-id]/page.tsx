// 🚩 flagging that for shared routes between roles, "Page" code is a component for code maintainability
import { OperationsSearchParams } from "@reporting/src/app/components/operations/types";
import OperationsPage from "@reporting/src/app/components/operations/OperationsPage";
import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonForm";

export default async function Page({
  searchParams,
}: {
  searchParams: OperationsSearchParams;
}) {
  return (
    <Suspense fallback={<Loading />}>
      <OperationsPage searchParams={searchParams} />
    </Suspense>
  );
}
