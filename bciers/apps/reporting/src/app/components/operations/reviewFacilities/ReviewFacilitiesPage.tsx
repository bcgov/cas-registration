import { getOperationFacilitiesList } from "@reporting/src/app/utils/getOperationFacilitiesList";
import ReviewFacilitiesForm from "./ReviewFacilitiesForm";
import { HasReportVersion } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import { buildReviewFacilitiesSchema } from "@reporting/src/data/jsonSchema/reviewFacilities/reviewFacilities";

export default async function LFOFacilitiesPage({
  version_id,
}: HasReportVersion) {
  const initialData = await getOperationFacilitiesList(version_id);
  console.log("LFOFacilitiesPage", initialData);

  return (
    <>
      <ReviewFacilitiesForm version_id={version_id} initialData={initialData} />
    </>
  );
}
