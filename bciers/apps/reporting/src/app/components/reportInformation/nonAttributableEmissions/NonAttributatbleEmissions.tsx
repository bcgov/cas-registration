import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonForm";
import NonAttributableEmissionsForm from "@reporting/src/app/components/reportInformation/nonAttributableEmissions/NonAttributableEmissionsForm";
import { UUID } from "crypto";

interface NonAttributableEmissionsProps {
  versionId: number;
  facilityId: UUID;
}

export default function NonAttributableEmissions({
  versionId,
  facilityId,
}: NonAttributableEmissionsProps) {
  return (
    <Suspense fallback={<Loading />}>
      <NonAttributableEmissionsForm
        versionId={versionId}
        facilityId={facilityId}
      />
    </Suspense>
  );
}
