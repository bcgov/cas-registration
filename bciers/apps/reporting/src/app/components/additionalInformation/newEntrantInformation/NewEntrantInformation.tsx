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

  const { new_entrant_data: initialFormData } = newEntrantData;

  const formData = {
    ...initialFormData,
    products: newEntrantData.products,
    emissions: newEntrantData.emissions,
  };
  return (
    <Suspense fallback={<Loading />}>
      <NewEntrantInformationForm
        versionId={versionId}
        initialFormData={formData}
      />
    </Suspense>
  );
}
