import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonForm";
import NonAttributableEmissionsForm from "@reporting/src/app/components/reportInformation/nonAttributableEmissions/NonAttributableEmissionsForm";
import { UUID } from "crypto";
import { getAllGasTypes } from "@reporting/src/app/utils/getAllGasTypes";
import { getAllEmissionCategories } from "@reporting/src/app/utils/getAllEmissionCategories";
import { getNonAttributableEmissionsData } from "@reporting/src/app/utils/getNonAttributableEmissionsData";

interface NonAttributableEmissionsProps {
  versionId: number;
  facilityId: UUID;
}

export default async function NonAttributableEmissionsPage({
  versionId,
  facilityId,
}: NonAttributableEmissionsProps) {
  const gasTypes = await getAllGasTypes();
  const emissionCategories = await getAllEmissionCategories();
  const emissionFormData = await getNonAttributableEmissionsData(
    versionId,
    facilityId,
  );

  const gasTypeMap = gasTypes.reduce(
    (
      acc: { [x: string]: any },
      gas: { id: string | number; chemical_formula: any },
    ) => {
      acc[gas.id] = gas.chemical_formula;
      return acc;
    },
    {} as Record<number, string>,
  );

  const emissionCategoryMap = emissionCategories.reduce(
    (
      acc: { [x: string]: any },
      category: { id: string | number; category_name: any },
    ) => {
      acc[category.id] = category.category_name;
      return acc;
    },
    {} as Record<number, string>,
  );

  return (
    <Suspense fallback={<Loading />}>
      <NonAttributableEmissionsForm
        versionId={versionId}
        facilityId={facilityId}
        emissionFormData={emissionFormData}
        gasTypes={gasTypes}
        emissionCategories={emissionCategories}
        gasTypeMap={gasTypeMap} // Pass the map to the form component
        emissionCategoryMap={emissionCategoryMap} // Pass the map to the form component
      />
    </Suspense>
  );
}
