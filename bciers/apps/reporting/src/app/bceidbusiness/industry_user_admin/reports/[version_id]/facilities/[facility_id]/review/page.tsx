import { UUID } from "crypto";
import FacilityReviewForm from "@reporting/src/app/components/facility/FacilityReviewForm";

export default function Page({
  params,
}: {
  params: { version_id: number; facility_id: UUID };
}) {
  return (
    <FacilityReviewForm
      version_id={params.version_id}
      facility_id={params.facility_id}
    />
  );
}
