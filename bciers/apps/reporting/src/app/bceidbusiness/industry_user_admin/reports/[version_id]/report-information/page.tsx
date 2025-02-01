import FacilitiesPage from "@reporting/src/app/components/reportInformation/Facilities/FacilitiesPage";
import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonForm";
import { FacilityReportSearchParams } from "@reporting/src/app/components/reportInformation/Facilities/types";

export default async function Page({
  searchParams,
  params,
}: Readonly<{
  searchParams: FacilityReportSearchParams;
  params: { version_id: number };
}>) {
  return (
    <Suspense fallback={<Loading />}>
      <FacilitiesPage
        searchParams={searchParams}
        version_id={params.version_id}
      />
    </Suspense>
  );
}
