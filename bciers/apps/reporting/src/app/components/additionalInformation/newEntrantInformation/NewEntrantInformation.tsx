import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonForm";
import NewEntrantInformationForm from "@reporting/src/app/components/additionalInformation/newEntrantInformation/NewEntrantInformationForm";

export default async function NewEntrantInformation({
  versionId,
}: {
  versionId: number;
}) {
  return (
    <Suspense fallback={<Loading />}>
      <NewEntrantInformationForm versionId={versionId} />
    </Suspense>
  );
}
