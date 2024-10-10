import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonForm";
import ProductionData from "@reporting/src/app/components/products/ProductionData";

export default async function Page({
  params,
}: {
  params: { version_id: number; facility_id: string };
}) {
  return (
    <Suspense fallback={<Loading />}>
      <ProductionData
        report_version_id={params.version_id}
        facility_id={params.facility_id}
      />
    </Suspense>
  );
}
