import FacilityReviewFormData from "@reporting/src/app/components/facility/FacilityReviewFormData";
import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonForm";

export default async function Page({
  params,
}: {
  params: { version_id: number; facility_id: number };
}) {
  return (
    <Suspense fallback={<Loading />}>
      <FacilityReviewFormData
        version_id={params.version_id}
        facility_id={params.facility_id}
      />
    </Suspense>
  );
}
