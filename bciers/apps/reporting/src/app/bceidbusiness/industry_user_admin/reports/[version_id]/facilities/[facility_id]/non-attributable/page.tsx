import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonForm";
import NonAttributableEmissions from "@reporting/src/app/components/reportInformation/nonAttributableEmissions/NonAttributatbleEmissions";
import { UUID } from "crypto";
export default async function Page({
  params,
}: {
  params: { version_id: number; facility_id: UUID };
}) {
  return (
    <Suspense fallback={<Loading />}>
      <NonAttributableEmissions
        versionId={params.version_id}
        facilityId={params.facility_id}
      />
    </Suspense>
  );
}
