import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonForm";
import NonAttributableEmissionsForm from "@reporting/src/app/components/reportInformation/nonAttributableEmissions/NonAttributableEmissionsForm";
import { UUID } from "crypto";
import { getAllGasTypes } from "@reporting/src/app/utils/getAllGasTypes";
import { getAllEmissionCategories } from "@reporting/src/app/utils/getAllEmissionCategories";

interface NonAttributableEmissionsProps {
  versionId: number;
  facilityId: UUID;
}

export default async function NonAttributableEmissions({
  versionId,
  facilityId,
}: NonAttributableEmissionsProps) {
  const gasTypes = await getAllGasTypes();
  const emissionCategories = await getAllEmissionCategories();
  return (
    <Suspense fallback={<Loading />}>
      <NonAttributableEmissionsForm
        versionId={versionId}
        facilityId={facilityId}
        gasTypes={gasTypes}
        emissionCategories={emissionCategories}
      />
    </Suspense>
  );
}
