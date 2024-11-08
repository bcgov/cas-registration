import { UUID } from "crypto";
import FacilityPage from "@/administration/app/components/facilities/FacilityPage";
import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonForm";

export default function Page({
  params,
}: {
  params: Readonly<{ operationId: UUID; facilityId: UUID }>;
}) {
  return (
    <Suspense fallback={<Loading />}>
      <FacilityPage
        facilityId={params.facilityId}
        operationId={params.operationId}
      />
    </Suspense>
  );
}
