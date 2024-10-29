import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonForm";
import { UUID } from "crypto";
import NonAttributatbleEmissions from "@reporting/src/app/components/reportInformation/nonAttributableEmissions/NonAttributatbleEmissions";

export default async function Page({
  params,
}: {
  params: { version_id: number; facility_id: UUID };
}) {
  return (
    <Suspense fallback={<Loading />}>
      <NonAttributatbleEmissions
        versionId={params.version_id}
        facilityId={params.facility_id}
      />
    </Suspense>
  );
}
