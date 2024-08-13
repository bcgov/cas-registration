import FacilityReview from "./FacilityReview";

export default async function FacilityReviewFormData({
  version_id,
  facility_id,
}: {
  version_id: number;
  facility_id: number;
}) {
  return <FacilityReview version_id={version_id} facility_id={facility_id} />;
}
