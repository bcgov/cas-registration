// 🚩 flagging that for shared routes between roles, "Page" code is a component for code maintainability
import Loading from "@bciers/components/loading/SkeletonGrid";
import TransfersDataGridPage from "@/registration/app/components/transfers/TransfersDataGridPage";
import { Suspense } from "react";
import { TransfersSearchParams } from "@/registration/app/components/transfers/types";

export default async function Page({
  searchParams,
}: {
  searchParams: TransfersSearchParams;
}) {
  return (
    <Suspense fallback={<Loading />}>
      <TransfersDataGridPage searchParams={searchParams} />
    </Suspense>
  );
}
