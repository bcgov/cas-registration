// 🚩 flagging that for shared routes between roles, "Page" code is a component for code maintainability
import Loading from "@bciers/components/loading/SkeletonGrid";
import TransferDataGridPage from "@/registration/app/components/transfers/TransferDataGridPage";
import { Suspense } from "react";
import { TransfersSearchParams } from "@/registration/app/components/transfers/types";

export default async function Page({
  searchParams,
}: {
  searchParams: TransfersSearchParams;
}) {
  return (
    <Suspense fallback={<Loading />}>
      <TransferDataGridPage searchParams={searchParams} />
    </Suspense>
  );
}
