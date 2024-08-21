import FacilityReviewFormData from "@reporting/src/app/components/facility/FacilityReviewFormData";

export default async function Page({
  params,
}: {
  params: { version_id: number; facility_id: number };
}) {
  return (
    <FacilityReviewFormData
      version_id={params.version_id}
      facility_id={params.facility_id}
    />
  );
}
