import FacilityReviewForm from "./FacilityReviewForm";
import { HasFacilityId } from "@reporting/src/app/utils/defaultPageFactoryTypes";

export default async function FacilityReviewPage({
  version_id,
  facility_id,
}: HasFacilityId) {
  return (
    <FacilityReviewForm version_id={version_id} facility_id={facility_id} />
  );
}
