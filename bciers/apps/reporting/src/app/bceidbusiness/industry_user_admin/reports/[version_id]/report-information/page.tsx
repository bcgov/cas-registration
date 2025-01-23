// 🚩 flagging that for shared routes between roles, "Page" code is a component for code maintainability
import { FacilitiesSearchParams } from "@reporting/src/app/components/operations/types";
import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonForm";
import FacilitiesPage from "@reporting/src/app/components/reportInformation/Facilities/FacilitiesPage";

export default async function Page({
  searchParams,
}: {
  searchParams: FacilitiesSearchParams;
}) {
  return (
    <Suspense fallback={<Loading />}>
      <FacilitiesPage searchParams={searchParams} />
    </Suspense>
  );
}
