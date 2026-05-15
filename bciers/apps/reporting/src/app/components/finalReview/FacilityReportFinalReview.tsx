import { getFacilityFinalReviewData } from "@reporting/src/app/utils/getFacilityFinalReviewData";
import { ReportingOrigin } from "@reporting/src/app/components/taskList/types";
import FacilityReportFinalReviewContent from "./FacilityReportFinalReviewContent";

export interface OriginSearchParams {
  origin?: ReportingOrigin;
}

export default async function FacilityReportFinalReview({
  version_id,
  facility_id,
  searchParams,
}: {
  version_id: number;
  facility_id: string;
  searchParams?: OriginSearchParams;
}) {
  const origin = searchParams?.origin;
  const backUrl = `/reporting/reports/${version_id}/${origin}#facility-grid`;

  const data = await getFacilityFinalReviewData(version_id, facility_id);

  return <FacilityReportFinalReviewContent data={data} backUrl={backUrl} />;
}
