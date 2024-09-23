import FacilityReview from "./FacilityReview";
import { UUID } from "crypto";

type FacilityReviewFormDataProps = Readonly<{
  version_id: number;
  facility_id: UUID;
}>;

export default function FacilityReviewFormData({
  version_id,
  facility_id,
}: FacilityReviewFormDataProps) {
  return <FacilityReview version_id={version_id} facility_id={facility_id} />;
}
