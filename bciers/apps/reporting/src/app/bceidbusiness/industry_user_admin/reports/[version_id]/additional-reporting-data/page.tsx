import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonForm";
import AdditionalReportingData from "@reporting/src/app/components/additionalInformation/additionalReportingData/AdditionalReportingData";
interface PageProps {
  params: { version_id: number };
}

export default async function Page({ params }: PageProps) {
  return (
    <Suspense fallback={<Loading />}>
      <AdditionalReportingData versionId={params.version_id} />
    </Suspense>
  );
}
