import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonForm";
import NewEntrantInformationForm from "./NewEntrantInformationForm";
import { getReportProducts } from "@reporting/src/app/utils/getReportProducts";

export default async function NewEntrantInformation({
  versionId,
}: {
  versionId: number;
}) {
  const reportProducts = await getReportProducts(versionId);

  return (
    <Suspense fallback={<Loading />}>
      <NewEntrantInformationForm
        versionId={versionId}
        products={reportProducts}
      />
    </Suspense>
  );
}
