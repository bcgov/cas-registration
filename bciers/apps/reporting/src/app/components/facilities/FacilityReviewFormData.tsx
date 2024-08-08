import { actionHandler } from "@bciers/actions";
import FacilityReview from "./FacilityReview";

export async function getReportFacilities(version_id: number) {
  return actionHandler(
    `reporting/report-version/${version_id}/report-operation`,
    "GET",
    `reporting/report-version/${version_id}/report-operation`,
  );
}

export default async function FacilityReviewFormData({
  version_id,
}: {
  version_id: number;
}) {
  const facilitiesList = await getReportFacilities(version_id);

  return <FacilityReview formData={{}} version_id={version_id} />;
}
