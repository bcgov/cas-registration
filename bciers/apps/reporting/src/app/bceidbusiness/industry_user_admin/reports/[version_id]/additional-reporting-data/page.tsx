import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonForm";
import AdditionalReportingData from "@reporting/src/app/components/additionalInformation/AdditionalReportingData";

export default async function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <AdditionalReportingData />
    </Suspense>
  );
}
