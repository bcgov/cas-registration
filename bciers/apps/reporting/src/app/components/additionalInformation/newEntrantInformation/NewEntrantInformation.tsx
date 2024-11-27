import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonForm";
import NewEntrantInformationForm from "./NewEntrantInformationForm";
import { getNewEntrantData } from "@reporting/src/app/utils/getNewEntrantData";

export default async function NewEntrantInformation({
  versionId,
}: {
  versionId: number;
}) {
  const newEntrantData = await getNewEntrantData(versionId);

  const emissions = newEntrantData.emission_category;
  const initialFormData = newEntrantData.report_new_entrant_data;
  const regulatedProducts = newEntrantData.allowed_products;

  return (
    <Suspense fallback={<Loading />}>
      <NewEntrantInformationForm
        versionId={versionId}
        products={regulatedProducts}
        initialFormData={initialFormData}
        emissions={emissions}
      />
    </Suspense>
  );
}
