import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonForm";
import AdditionalReportingData from "@reporting/src/app/components/additionalInformation/AdditionalReportingData";

export default async function Page({
  params,
}: {
  params: { version_id: number };
}) {
  return (
    <Suspense fallback={<Loading />}>
      <AdditionalReportingData version_id={params.version_id} />
    </Suspense>
  );
}
