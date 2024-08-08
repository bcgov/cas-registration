import FacilityReviewFormData from "../../../../../../components/facilities/FacilityReviewFormData";

export default async function Page({
  params,
}: {
  params: { version_id: number };
}) {
  return <FacilityReviewFormData version_id={params.version_id} />;
}
