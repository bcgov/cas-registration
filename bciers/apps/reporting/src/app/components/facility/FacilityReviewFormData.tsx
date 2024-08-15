import FacilityReview from "./FacilityReview";

type FacilityReviewFormDataProps = Readonly<{
  version_id: number;
  facility_id: number;
}>;

export default function FacilityReviewFormData({
  version_id,
  facility_id,
}: FacilityReviewFormDataProps) {
  return <FacilityReview version_id={version_id} facility_id={facility_id} />;
}
