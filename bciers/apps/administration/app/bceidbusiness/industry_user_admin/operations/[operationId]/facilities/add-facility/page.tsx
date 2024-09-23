import { UUID } from "crypto";
import FacilityPage from "@/administration/app/components/facilities/FacilityPage";
import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonForm";

export default function Page({
  params,
}: {
  params: Readonly<{ operationId: UUID }>;
}) {
  return (
    <Suspense fallback={<Loading />}>
      <FacilityPage operationId={params.operationId} />
    </Suspense>
  );
}
