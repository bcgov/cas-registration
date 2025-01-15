import ReviewFacilities from "@reporting/src/app/components/operations/reviewFacilities/ReviewFacilitiesPage";
import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonForm";

export default async function Page({
  params,
}: {
  params: { version_id: number };
}) {
  return (
    <Suspense fallback={<Loading />}>
      <ReviewFacilities version_id={params.version_id} />
    </Suspense>
  );
}
